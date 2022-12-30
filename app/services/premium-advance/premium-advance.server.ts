import type {
  AdminUser,
  Company,
  Employee,
  PremiumAdvance,
  Prisma,
  User,
} from '@prisma/client'

import { PremiumAdvanceHistoryActor } from '@prisma/client'
import { prisma } from '~/db.server'
import { CLIENT_URL, sendEmail } from '../email/email.server'
import { PremiumAdvanceStatus } from '@prisma/client'
import { badRequest } from 'remix-utils'
import { connect } from '~/utils/relationships'
import type { TBasicTemplate } from '../email/templates/basic/interface'

export const getPremiumAdvances = async (args?: {
  where?: Prisma.PremiumAdvanceFindManyArgs['where']
}) => {
  const { where } = args || {}
  return prisma.premiumAdvance.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      employee: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      company: {
        select: {
          name: true,
        },
      },
    },
  })
}

export const getPremiumAdvanceById = async (
  premiumAdvanceId: PremiumAdvance['id']
) => {
  return prisma.premiumAdvance.findUnique({
    where: { id: premiumAdvanceId },
    include: {
      employee: {
        select: {
          id: true,
          currencyId: true,
          advanceAvailableAmount: true,
          advanceCryptoAvailableAmount: true,
          advanceCryptoMaxAmount: true,
          advanceMaxAmount: true,
          phone: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
      company: true,
      history: {
        include: {
          employee: true,
        },
      },
    },
  })
}

interface ICreatePremiumAdvanceArgs {
  employeeId: Employee['id']
  companyId: Company['id']
  user: Pick<User, 'firstName' | 'lastName'>
}

export const createPremiumAdvance = async ({
  employeeId,
  companyId,
  user,
}: ICreatePremiumAdvanceArgs) => {
  try {
    const premiumAdvance = await prisma.premiumAdvance.create({
      data: {
        companyId,
        employeeId,
        status: PremiumAdvanceStatus.REQUESTED,
        history: {
          create: {
            actor: PremiumAdvanceHistoryActor.EMPLOYEE,
            toStatus: PremiumAdvanceStatus.REQUESTED,
          },
        },
      },
    })

    sendPremiumAdvanceNotificationToAdmin({
      employeeFullName: `${user.firstName} ${user.lastName}`,
      status: PremiumAdvanceStatus.REQUESTED,
      premiumAdvanceId: premiumAdvance.id,
    })

    return premiumAdvance
  } catch (e) {
    // todo: Save log to a file
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error al solicitar tu adelanto de prima. Por favor, informa de lo sucedido directamente a hoyadelantas@hoytrabajas.com'
    )
  }
}

const { CANCELLED, DENIED, APPROVED, PAID } = PremiumAdvanceStatus
export const updatePremiumAdvanceStatus = async ({
  employee,
  user,
  adminUser,
  premiumAdvance,
  toStatus,
  actor,
}: {
  employee: Pick<Employee, 'id' | 'phone'>
  adminUser?: Pick<AdminUser, 'id'>
  user: Pick<User, 'firstName' | 'lastName' | 'email'>
  premiumAdvance: Pick<PremiumAdvance, 'id' | 'status' | 'companyId'>
  toStatus: PremiumAdvanceStatus
  actor: PremiumAdvanceHistoryActor
}) => {
  if (premiumAdvance.status === toStatus) {
    throw badRequest('El adelanto de nómina ya se encuentra actualizado')
  }

  if (premiumAdvance.status === PAID) {
    throw badRequest(
      'El adelanto de nómina ya fue pagado, no puede actualizarse'
    )
  }

  const createHistory: Prisma.PremiumAdvanceUpdateInput['history'] = {
    create: {
      actor,
      toStatus,

      employee:
        actor === PremiumAdvanceHistoryActor.EMPLOYEE
          ? connect(employee.id)
          : undefined,

      adminUser:
        actor === PremiumAdvanceHistoryActor.ADMIN
          ? connect(adminUser?.id)
          : undefined,
    },
  }

  try {
    const updatedPremiumAdvance = await prisma.premiumAdvance.update({
      where: {
        id: premiumAdvance.id,
      },
      data: {
        status: toStatus,
        history: createHistory,
      },
    })

    switch (toStatus) {
      case DENIED: {
        sendPremiumAdvanceNotificationToUser({
          destination: user.email,
          premiumAdvanceId: updatedPremiumAdvance.id,
          status: toStatus,
        })

        break
      }

      case CANCELLED: {
        sendPremiumAdvanceNotificationToAdmin({
          premiumAdvanceId: updatedPremiumAdvance.id,
          status: toStatus,
          employeeFullName: `${user.firstName} ${user.lastName}`,
        })
        break
      }

      case APPROVED: {
        sendPremiumAdvanceNotificationToUser({
          destination: user.email,
          premiumAdvanceId: updatedPremiumAdvance.id,
          status: toStatus,
        })
        break
      }

      case PAID: {
        sendPremiumAdvanceNotificationToUser({
          destination: user.email,
          premiumAdvanceId: premiumAdvance.id,
          status: toStatus,
        })

        // if (employee.phone) {
        //   await sendSMS({
        //     PhoneNumber: employee.phone,
        //     Message:
        //       '¡Tu solicitud de adelanto ha sido desembolsada! En unas horas el dinero se verá reflejado en tu cuenta :grinning:',
        //   })
        // }
        break
      }

      default:
        break
    }

    return updatedPremiumAdvance
  } catch (e) {
    // Todo LOGGER: Log error and save to a file
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error durante la actualización del adelanto de nómina'
    )
  }
}

// todo: move "email" related functions to another file inside this folder
// could be named premium-advance.emails.server.ts

const userPremiumAdvanceNotifications = {
  [PremiumAdvanceStatus.REQUESTED]: {
    subject: 'Has solicitado un adelanto',
    title: '¡Tu solicitud ha sido recibida!',
  },
  [PremiumAdvanceStatus.DENIED]: {
    subject: 'Tu solicitud de adelanto ha sido denegada',
    title: 'Solicitud denegada',
  },
  [PremiumAdvanceStatus.APPROVED]: {
    subject: '¡Tu desembolso ha sido aprobado!',
    title: '¡Desembolso aprobado!',
  },
  [PremiumAdvanceStatus.PAID]: {
    subject: '¡Tu desembolso ha sido procesado!',
    title: '¡Desembolso realizado!',
  },
}

type TSendPremiumAdvanceNotificationToUserArgs = {
  destination: string
  premiumAdvanceId: string | number
  status: Extract<
    PremiumAdvanceStatus,
    'DENIED' | 'REQUESTED' | 'PAID' | 'APPROVED'
  >
}

/** Notify the user about PremiumAdvance updates */
export const sendPremiumAdvanceNotificationToUser = async ({
  destination,
  premiumAdvanceId,
  status,
}: TSendPremiumAdvanceNotificationToUserArgs) => {
  const { title, subject } = userPremiumAdvanceNotifications[status]

  const templateData: TBasicTemplate = {
    title,
    firstLine:
      'Por favor, haz click en el siguiente enlace para obtener más información acerca de tu solicitud',
    button: 'Ver solicitud',
    buttonHref: `${CLIENT_URL}/dashboard/premium-advances/${premiumAdvanceId}`,
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: destination,
      subject,
    },
    templateData,
  })
}

const adminPremiumAdvanceNotifications = {
  [PremiumAdvanceStatus.REQUESTED]: (employeeFullName?: string) => ({
    subject: employeeFullName
      ? `${employeeFullName} ha solicitado un adelanto de prima`
      : 'Nueva solicitud de adelanto',
    title: 'Nueva solicitud',
  }),
  [PremiumAdvanceStatus.CANCELLED]: (employeeFullName?: string) => ({
    subject: employeeFullName
      ? `${employeeFullName} ha cancelado su solicitud`
      : 'Una solicitud ha sido cancelada',
    title: 'Solicitud cancelada',
  }),
}

type TSendPremiumAdvanceNotificationToAdminArgs = {
  status: Extract<PremiumAdvanceStatus, 'CANCELLED' | 'REQUESTED'>
  premiumAdvanceId: string | number
  employeeFullName?: string
}

/** Notify the admin about a new PremiumAdvance request */
export const sendPremiumAdvanceNotificationToAdmin = async ({
  status,
  premiumAdvanceId,
  employeeFullName,
}: TSendPremiumAdvanceNotificationToAdminArgs) => {
  const { title, subject } =
    adminPremiumAdvanceNotifications[status](employeeFullName)

  const templateData: TBasicTemplate = {
    title,
    firstLine:
      'Por favor, haz click en el siguiente enlace para obtener más información',
    button: 'Ver solicitud',
    buttonHref: `${CLIENT_URL}/admin/dashboard/premium-advances/${premiumAdvanceId}`,
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL

  if (!adminEmail) {
    throw new Error('Please add the ADMIN_NOTIFICATION_EMAIL to .env')
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: adminEmail,
      subject,
    },
    templateData,
  })
}
