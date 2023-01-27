import Email from 'email-templates'
import nodemailer from 'nodemailer'
import { PayrollAdvanceStatus } from '@prisma/client'
import * as aws from '@aws-sdk/client-ses'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

import type { TBasicTemplate } from './templates/basic/interface'

type TEmailInfo = {
  to: string
  subject: string
}

type TSendLoginArgs = {
  destination: string
  firstName: string
  token: string
}

export const CLIENT_URL =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? process.env.DEV_APP_URL
    : process.env.PROD_APP_URL

const credentials = defaultProvider()

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1',
  credentials,
})

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
})

const emailConfig: () => Email.EmailConfig = () => {
  const name = process.env.SMTP_EMAIL_NAME
  const address = process.env.SMTP_EMAIL

  if (!name || !address) {
    throw new Error('SMTP_EMAIL_NAME and SMTP_EMAIL variables not set')
  }

  return {
    views: { root: './app/services/email/templates/' },
    message: {
      from: {
        name: process.env.SMTP_EMAIL_NAME as string,
        address: process.env.SMTP_EMAIL as string,
      },
      replyTo: process.env.SMTP_EMAIL as string,
    },
    transport: transporter,
    juice: true,
    preview: process.env.NODE_ENV === 'development' && {
      open: {
        app: 'chrome',
      },
      urlTransform: (path) => `file://wsl.localhost/Ubuntu-22.04/${path}`,
      openSimulator: true,
    },
  }
}

export const sendEmail = async ({
  info,
  templateName,
  templateData,
}: {
  info: TEmailInfo
  templateName: string
  templateData: Record<string, unknown>
}) => {
  const email = new Email({
    ...emailConfig(),
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: `./app/services/email/templates/${templateName}`,
      },
    },
  })

  const renderedEmail = await email.render(`${templateName}/html`, templateData)

  return email.send({
    message: {
      html: renderedEmail,
      ...info,
    },
  })
}

/** Send a login link to an existing user on SignIn */
export const sendLoginLink = async ({
  destination,
  firstName,
  token,
}: TSendLoginArgs) => {
  const templateData: TBasicTemplate = {
    title: 'Inicio de sesión',
    firstLine: `Hola ${firstName},`,
    secondLine: 'Solicitaste un enlace para iniciar sesión.',
    thirdLine: 'Haz click en el siguiente botón para acceder a tu cuenta.',
    button: 'Ingresar',
    buttonHref: `${CLIENT_URL}/verify-login?token=${token}`,
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: destination,
      subject: 'Enlace de inicio de sesión',
    },
    templateData,
  })
}

/** Send an invitation to new users on SignUp */
export const sendInvitation = async ({
  destination,
  firstName,
  token,
}: TSendLoginArgs) => {
  const templateData: TBasicTemplate = {
    title: '¡Bienvenido al portal de beneficios de HoyTrabajas!',
    firstLine: `Hola ${firstName},`,
    secondLine: `Ahora puedes aprovechar nuestro plan de beneficios pensados para ti y tu familia. Accede a herramientas y descuentos que harán tu vida más fácil.`,
    thirdLine: 'Solo haz click y úsalos totalmente grátis.',
    button: 'Ingresar',
    buttonHref: `${CLIENT_URL}/verify-login?token=${token}`,
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: destination,
      subject: '¡HoyTrabajas te da la bienvenida a un mundo de beneficios!',
    },
    templateData,
  })
}

const adminPayrollNotifications = {
  [PayrollAdvanceStatus.REQUESTED]: (employeeFullName?: string) => ({
    subject: employeeFullName
      ? `${employeeFullName} ha solicitado un adelanto de nómina`
      : 'Nueva solicitud de adelanto',
    title: 'Nueva solicitud',
  }),
  [PayrollAdvanceStatus.CANCELLED]: (employeeFullName?: string) => ({
    subject: employeeFullName
      ? `${employeeFullName} ha cancelado su solicitud`
      : 'Una solicitud ha sido cancelada',
    title: 'Solicitud cancelada',
  }),
}

type TSendAdminPayrollNotificationArgs = {
  payrollId: string | number
  status: Extract<PayrollAdvanceStatus, 'CANCELLED' | 'REQUESTED'>
  employeeFullName?: string
}

/** Notify the admin about Payroll updates */
export const sendPayrollNotificationToAdmin = async ({
  payrollId,
  status,
  employeeFullName,
}: TSendAdminPayrollNotificationArgs) => {
  const templateData: TBasicTemplate = {
    title: adminPayrollNotifications[status](employeeFullName).title,
    firstLine:
      'Por favor, haz click en el siguiente enlace para obtener más información',
    button: 'Ver solicitud',
    buttonHref: `${CLIENT_URL}/admin/dashboard/payroll-advances/${payrollId}`,
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL

  if (!adminEmail) {
    throw new Error('Please, add the ADMIN_NOTIFICATION_EMAIL to .env')
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: adminEmail,
      subject: adminPayrollNotifications[status](employeeFullName).subject,
    },
    templateData,
  })
}

const userPayrollNotifications = {
  [PayrollAdvanceStatus.REQUESTED]: {
    subject: 'Has solicitado un adelanto de nómina',
    title: '¡Tu solicitud ha sido recibida!',
  },
  [PayrollAdvanceStatus.DENIED]: {
    subject: 'Tu solicitud de adelanto ha sido denegada',
    title: 'Solicitud denegada',
  },
  [PayrollAdvanceStatus.APPROVED]: {
    subject: '¡Tu desembolso ha sido aprobado!',
    title: '¡Desembolso aprobado!',
  },
  [PayrollAdvanceStatus.PAID]: {
    subject: '¡Tu desembolso ha sido procesado!',
    title: '¡Desembolso realizado!',
  },
}

type TSendPayrollNotificationArgs = {
  destination: string
  payrollId: string | number
  status: Extract<
    PayrollAdvanceStatus,
    'DENIED' | 'REQUESTED' | 'PAID' | 'APPROVED'
  >
}

/** Notify the user about PayrollAdvance updates */
export const sendPayrollNotificationToUser = async ({
  destination,
  payrollId,
  status,
}: TSendPayrollNotificationArgs) => {
  const templateData: TBasicTemplate = {
    title: userPayrollNotifications[status].title,
    firstLine:
      'Por favor, haz click en el siguiente enlace para obtener más información acerca de tu solicitud',
    button: 'Ver solicitud',
    buttonHref: `${CLIENT_URL}/dashboard/payroll-advances/${payrollId}`,
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: destination,
      subject: userPayrollNotifications[status].subject,
    },
    templateData,
  })
}

/** Send a link to update current password */
export const sendResetPasswordLink = async ({
  destination,
  firstName,
  token,
}: TSendLoginArgs) => {
  const templateData: TBasicTemplate = {
    title: 'Recuperación de contraseña',
    firstLine: `Hola ${firstName},`,
    secondLine:
      'Recibes este correo porque solicitaste recuperar tu contraseña.',
    thirdLine: 'Por favor, haz click en el siguiente botón para actualizarla.',
    button: 'Cambiar contraseña',
    buttonHref: `${CLIENT_URL}/verify-login?token=${token}&updatePassword=true`,
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: destination,
      subject: 'Recuperación de contraseña',
    },
    templateData,
  })
}
