import type { User } from '@prisma/client'

import ms from 'ms'
import { badRequest } from 'remix-utils'
import { randomBytes } from 'crypto'
import { hash } from 'bcryptjs'
import { promisify } from 'util'

import { prisma } from '~/db.server'
import { sendLoginLink, sendResetPasswordLink } from './email/email.server'

const LOGIN_EXPIRES_IN = '24h' as const

export const requestLoginLink = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  })

  if (!user) {
    // We don't throw here because we should not inform the user that
    // the email does not exist.
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

export const requestPasswordChange = async (email: string) => {
  const loginToken = await generateRandomToken()
  const loginExpiration = generateExpirationDate(LOGIN_EXPIRES_IN)

  const userToUpdate = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!userToUpdate) {
    return
  }

  const updatedUser = await prisma.user.update({
    where: { id: userToUpdate.id },
    data: {
      loginExpiration,
      loginToken,
    },
  })

  return sendResetPasswordLink({
    destination: email.toLowerCase(),
    firstName: updatedUser.firstName || '',
    token: loginToken,
  })
}

export const updatePassword = async (userId: User['id'], password: string) => {
  try {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: await hash(password, 10),
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error durante la actualización de la contraseña'
    )
  }
}

export const generateExpirationDate = (expiresIn: string) => {
  const expirationDate = ms(expiresIn)
  return new Date(Date.now() + expirationDate)
}

export const generateRandomToken = async () => {
  return (await promisify(randomBytes)(20)).toString('hex')
}
