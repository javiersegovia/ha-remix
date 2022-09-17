import type { User } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
      verifiedEmail: true,
      employee: {
        select: {
          id: true,
          companyId: true,
          roles: true,
          status: true,
        },
      },
    },
  })
}

export async function verifyUserLogin(email: User['email'], password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      employee: true,
    },
  })

  if (!user || !user?.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid || !user.employee) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = user

  return userWithoutPassword
}
