import type { AdminUser } from '@prisma/client'
import { prisma } from '~/db.server'
import bcrypt from 'bcryptjs'

export async function getAdminUserById(id: AdminUser['id']) {
  return prisma.adminUser.findFirst({
    where: { id },
    select: {
      id: true,
      email: true,
    },
  })
}

export async function verifyAdminUserLogin(
  email: AdminUser['email'],
  password: string
) {
  const adminUser = await prisma.adminUser.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  })

  if (!adminUser || !adminUser?.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, adminUser.password)
  if (!isValid) {
    return null
  }

  const { password: _password, ...adminUserWithoutPassword } = adminUser

  return adminUserWithoutPassword
}
