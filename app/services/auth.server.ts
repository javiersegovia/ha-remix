import ms from 'ms'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { prisma } from '~/db.server'
import { sendLoginLink } from './email/email.server'

const LOGIN_EXPIRES_IN = '1h'

export const requestLoginLink = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  })

  if (!user) {
    return
  }

  const loginExpiration = generateExpirationDate(LOGIN_EXPIRES_IN)
  const loginToken = await generateRandomToken()

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      loginExpiration,
      loginToken,
    },
  })

  return sendLoginLink({
    firstName: updatedUser.firstName || 'Usuario',
    destination: updatedUser.email,
    token: loginToken,
  })
}

export const verifyLoginLink = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      loginToken: token,
    },
  })

  if (!user) {
    throw new Error('Tu enlace de inicio de sesión es inválido.')
  }

  if (
    user?.loginExpiration &&
    new Date().getTime() > user.loginExpiration.getTime()
  ) {
    throw new Error('Tu enlace de inicio de sesión ha expirado.')
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verifiedEmail: true,
      loginToken: null,
      loginExpiration: null,
    },
    include: {
      employee: true,
    },
  })

  return {
    user: updatedUser,
    hasPassword: Boolean(user.password),
    hasAcceptedTerms:
      updatedUser.employee?.acceptedPrivacyPolicy &&
      updatedUser.employee?.acceptedTermsOfService,
  }
}

export const generateExpirationDate = (expiresIn: string) => {
  const expirationDate = ms(expiresIn)
  return new Date(Date.now() + expirationDate)
}

export const generateRandomToken = async () => {
  return (await promisify(randomBytes)(20)).toString('hex')
}
