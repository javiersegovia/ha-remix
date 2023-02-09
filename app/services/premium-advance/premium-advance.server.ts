import type { TBasicTemplate } from '~/services/email/templates/basic/interface'
import type {
  AdminUser,
  Benefit,
  Employee,
  PremiumAdvance,
  Prisma,
  User,
} from '@prisma/client'
import { PayrollAdvanceStatus } from '@prisma/client'
import { CompanyStatus, EmployeeStatus } from '@prisma/client'

import { PremiumAdvanceHistoryActor } from '@prisma/client'
import { prisma } from '~/db.server'
import { CLIENT_URL, sendEmail } from '../email/email.server'
import { PremiumAdvanceStatus } from '@prisma/client'
import { badRequest, forbidden, notFound } from 'remix-utils'
import { connect } from '~/utils/relationships'
import { sanitizeDate } from '~/utils/formatDate'
import { formatDistanceStrict } from 'date-fns'
import type { getEmployeeById } from '../employee/employee.server'
import type { CalculatePremiumAdvanceSchemaInput } from '~/schemas/calculate-premium-advance.schema'
import type { ITaxItem } from '../payroll-advance/payroll-advance.interface'

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
      requestedAmount: true,
      totalAmount: true,
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
      bankAccountData: true,
      requestReason: {
        select: { name: true },
      },
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
      taxes: true,
      history: {
        include: {
          employee: true,
        },
      },
    },
  })
}

export const calculatePremiumAdvanceSpecs = async (
  employeeId: Employee['id']
) => {
  const employeeData = await getEmployeeData(employeeId)

  const { transportationAid } =
    (await prisma.globalSettings.findFirst({
      select: {
        transportationAid: true,
      },
    })) || {}

  if (employeeData?.status === EmployeeStatus.INACTIVE) {
    throw badRequest('La cuenta del usuario se encuentra inactiva')
  }
  if (employeeData?.company.status === CompanyStatus.INACTIVE) {
    throw badRequest('La cuenta de la empresa se encuentra inactiva')
  }
  if (!employeeData?.salaryFiat) {
    throw badRequest('El salario no ha sido registrado')
  }
  if (!employeeData?.startedAt) {
    throw badRequest('La fecha de ingreso a la compañía no ha sido registrada')
  }
  if (!employeeData?.bankAccount) {
    throw badRequest('La cuenta bancaria no ha sido registrada')
  }

  const currentTimestamp = new Date().getTime()

  /**  We take two reference dates for the Premium Advances:
   *   January 1 and July 1.
   */
  const { januaryLimitDate, julyLimitDate } = getPremiumAdvanceLimits()

  /**
   *  Here we check if we will take January or July as reference,
   *  based on the currentTimestamp.
   *
   *  If we are in March, we should take January as reference.
   *  If we are in August, we should take July as reference.
   */
  const premiumAdvancePaymentLimit =
    julyLimitDate.getTime() > currentTimestamp
      ? januaryLimitDate
      : julyLimitDate

  /**
   *  Here we check if we will use the employee.startedAt as startDate, the premiumAdvance referenceDate, or the most recent paid premiumAdvance date,
   *  based on which date is the most recent date.
   */
  const paidPremiumAdvances = employeeData.premiumAdvances?.[0]
  const initDate =
    paidPremiumAdvances?.createdAt &&
    paidPremiumAdvances?.createdAt.getTime() > employeeData.startedAt.getTime()
      ? paidPremiumAdvances?.createdAt
      : employeeData.startedAt

  const startDate =
    initDate.getTime() > premiumAdvancePaymentLimit.getTime()
      ? initDate
      : premiumAdvancePaymentLimit

  const endDate = new Date()

  /** We calculate the total working days and then parse the result  */
  const workingDaysString = formatDistanceStrict(endDate, startDate, {
    unit: 'day',
  })
    .match(/\d/g)
    ?.join('')
  const workingDays = workingDaysString ? parseFloat(workingDaysString) : 0

  const baseSalary = employeeData.salaryFiat + (transportationAid || 0)

  /** We return the result by using the following formula:
   *
   *  (BASE_SALARY / 360) * WORKING_DAYS
   *
   */
  const availableAmount = parseFloat(
    ((baseSalary / 360) * workingDays).toFixed(2)
  )

  return { availableAmount, workingDays, startDate, endDate }
}

export const calculatePremiumAdvanceCost = async (
  data: CalculatePremiumAdvanceSchemaInput,
  employeeId: Employee['id']
) => {
  const { requestedAmount } = data

  const { availableAmount, workingDays, startDate, endDate } =
    await calculatePremiumAdvanceSpecs(employeeId)

  if (requestedAmount > availableAmount) {
    return {
      fieldErrors: {
        requestedAmount: 'El monto solicitado supera el monto disponible',
      },
    }
  }

  const employeeData = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      company: {
        select: {
          premiumDispersion: true,
        },
      },
    },
  })

  if (!employeeData) {
    throw notFound('El usuario no ha sido encontrado')
  }

  const globalSettings = await prisma.globalSettings.findFirst({
    select: {
      annualInterestRate: true,
    },
  })

  const taxItems: ITaxItem[] = []
  const currentDate = sanitizeDate(new Date()) as Date

  /** Interests formula:
   *  REQUESTED_AMOUNT * ((1 + ANNUAL_INTEREST_RATE)^(WORKING_DAYS/365) - 1)
   */
  let interests = 0
  if (globalSettings?.annualInterestRate) {
    const annualInterestRate = globalSettings.annualInterestRate / 100

    interests = Math.round(
      requestedAmount *
        (Math.pow(1 + annualInterestRate, (workingDays - 1) / 365) - 1)
    )

    const dateString = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`

    taxItems.push({
      name: 'Intereses',
      description: `Tasa calculada el ${dateString}, a ${globalSettings.annualInterestRate}%, considerando un plazo de ${workingDays} días trabajados`,
      value: interests,
    })
  }

  /** GMF & Dispersion formula:
   *  (REQUESTED_AMOUNT * 4/1000) + BASE_DISPERSION_AMOUNT
   */
  const dispersion = Math.round(
    (requestedAmount * 4) / 1000 + (employeeData.company.premiumDispersion || 0)
  )

  taxItems.push({
    name: '4x1000 y costo transacción',
    description: `Dispersión calculada utilizando ${employeeData.company.premiumDispersion} como base`,
    value: dispersion,
  })

  /**  Total amount formula:
   *  REQUESTED_AMOUNT + INTERESTS + GMF & DISPERSION
   */
  const totalAmount = requestedAmount + interests + dispersion

  return { totalAmount, taxItems, startDate, endDate }
}

export const createPremiumAdvance = async (
  data: CalculatePremiumAdvanceSchemaInput,
  employeeId: Employee['id']
) => {
  const { requestedAmount, requestReasonId, requestReasonDescription } = data

  const { totalAmount, taxItems, startDate, endDate, fieldErrors } =
    await calculatePremiumAdvanceCost(
      {
        requestedAmount,
        requestReasonId,
        requestReasonDescription,
      },
      employeeId
    )

  if (fieldErrors) {
    return { fieldErrors }
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      company: {
        select: {
          id: true,
        },
      },
      bankAccount: {
        select: {
          accountNumber: true,
          bank: {
            select: {
              name: true,
            },
          },
          accountType: {
            select: {
              name: true,
            },
          },
          identityDocument: {
            select: {
              value: true,
              documentType: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const { company, bankAccount } = employee!
  const { bank, accountNumber, accountType, identityDocument } = bankAccount!

  const createManyTaxes: Prisma.PremiumAdvanceCreateInput['taxes'] =
    taxItems.length > 0
      ? {
          createMany: { data: taxItems },
        }
      : {}

  const createHistory: Prisma.PremiumAdvanceCreateInput['history'] = {
    create: {
      toStatus: PremiumAdvanceStatus.REQUESTED,
      actor: PremiumAdvanceHistoryActor.EMPLOYEE,
      employee: connect(employeeId),
    },
  }

  try {
    const premiumAdvance = await prisma.premiumAdvance.create({
      data: {
        requestedAmount,
        totalAmount,
        startDate,
        endDate,
        company: connect(company.id),
        employee: connect(employeeId),
        history: createHistory,
        taxes: createManyTaxes,
        requestReason: connect(requestReasonId),
        requestReasonDescription,
        bankAccountData: {
          create: {
            accountNumber,
            accountType: accountType.name,
            bankName: bank.name,
            identityDocumentType: identityDocument.documentType.name,
            identityDocumentValue: identityDocument.value,
            currencyName: 'Pesos colombianos',
          },
        },
      },
    })

    sendPremiumAdvanceNotificationToAdmin({
      employeeFullName: `${employee!.user.firstName} ${
        employee!.user.lastName
      }`,
      status: PremiumAdvanceStatus.REQUESTED,
      premiumAdvanceId: premiumAdvance.id,
    })

    return { premiumAdvance }
  } catch (e) {
    console.error(e)
    throw forbidden(
      'Ocurrió un error durante la creación del adelanto de prima. Por favor contacta a un administrador'
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
    const currentDate = sanitizeDate(new Date())
    const updatedPremiumAdvance = await prisma.premiumAdvance.update({
      where: {
        id: premiumAdvance.id,
      },
      data: {
        status: toStatus,
        history: createHistory,
        approvedAt:
          toStatus === PremiumAdvanceStatus.APPROVED ? currentDate : undefined,
        paidAt:
          toStatus === PremiumAdvanceStatus.PAID ? currentDate : undefined,
        deniedAt:
          toStatus === PremiumAdvanceStatus.DENIED ? currentDate : undefined,
        cancelledAt:
          toStatus === PremiumAdvanceStatus.CANCELLED ? currentDate : undefined,
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

export const verifyIfEmployeeCanRequestPremiumAdvance = ({
  employee,
  enabledBenefits,
}: {
  employee: NonNullable<Awaited<ReturnType<typeof getEmployeeById>>>
  enabledBenefits: Benefit[]
}) => {
  let errorMessage: string | null = null

  if (employee.status === EmployeeStatus.INACTIVE) {
    errorMessage = 'Tu cuenta se encuentra inactiva'
  } else if (employee.company.status === CompanyStatus.INACTIVE) {
    errorMessage = 'Tu compañía se encuentra inactiva'
  } else if (!employee.salaryFiat) {
    errorMessage =
      'Tu salario no ha sido registrado. Por favor, contacta a un administrador.'
  } else if (!employee.bankAccount) {
    errorMessage =
      'Tu cuenta bancaria no ha sido registrada. Por favor, contacta a un administrador.'
  } else if (!employee.startedAt) {
    errorMessage =
      'Tu fecha de ingreso a la compañía no ha sido registrada. Por favor, contacta a un administrador.'
  }

  const canUsePremiumAdvances = process.env.SLUG_PREMIUM_ADVANCE
    ? enabledBenefits.some((b) => b.slug === process.env.SLUG_PREMIUM_ADVANCE)
    : true

  return { errorMessage, canUsePremiumAdvances }
}

const getPremiumAdvanceLimits = () => {
  const currentDate = new Date()

  return {
    januaryLimitDate: new Date(currentDate.getUTCFullYear(), 0, 1),
    julyLimitDate: new Date(currentDate.getUTCFullYear(), 6, 1),
  }
}

const getEmployeeData = async (employeeId: Employee['id']) => {
  return prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      premiumAdvances: {
        where: {
          status: PayrollAdvanceStatus.PAID,
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      status: true,
      startedAt: true,
      salaryFiat: true,
      bankAccount: true,
      company: {
        select: {
          status: true,
          benefits: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  })
}
