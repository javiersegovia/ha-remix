import Email from 'email-templates'
import nodemailer from 'nodemailer'
import * as aws from '@aws-sdk/client-ses'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

import type { TBasicTemplate } from './templates/basic/interface'
import type { Company, Employee } from '@prisma/client'

type TEmailInfo = {
  to: string
  subject: string
}

type TSendLoginArgs = {
  destination: string
  firstName: string
  token: string
}

const CLIENT_URL =
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
        app: 'firefox',
        wait: false,
      },
    },
  }
}

const sendEmail = async ({
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
    title: 'Invitación a HoyAdelantas',
    firstLine: `Hola ${firstName},`,
    secondLine: '¡Bienvenido a HoyAdelantas!',
    thirdLine:
      'Haz click en el siguiente botón para ingresar a tu cuenta y validar tus datos.',
    button: 'Ingresar',
    buttonHref: `${CLIENT_URL}/verify-login?token=${token}`,
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: destination,
      subject: '¡Has sido invitado a HoyAdelantas!',
    },
    templateData,
  })
}

type TSendPremiumAdvanceNotificationArgs = {
  employeeFullName?: string
  companyId: Company['id']
  employeeId: Employee['id']
}

/** Notify the admin about a new PremiumAdvance request */
export const sendPremiumAdvanceNotificationToAdmin = async ({
  employeeFullName,
  companyId,
  employeeId,
}: TSendPremiumAdvanceNotificationArgs) => {
  const templateData: TBasicTemplate = {
    title: `${employeeFullName} desea un adelanto de prima`,
    firstLine:
      'Por favor, haz click en el siguiente enlace para obtener más información',
    button: 'Ver colaborador',
    buttonHref: `${CLIENT_URL}/admin/dashboard/companies/${companyId}/employees/${employeeId}`,
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL

  if (!adminEmail) {
    throw new Error('Please add the ADMIN_NOTIFICATION_EMAIL to .env')
  }

  return sendEmail({
    templateName: 'basic',
    info: {
      to: adminEmail,
      subject: `${employeeFullName} desea un adelanto de prima`,
    },
    templateData,
  })
}
