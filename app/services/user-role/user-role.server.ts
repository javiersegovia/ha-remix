import type { UserRole } from '@prisma/client'
import type { UserRoleInputSchema } from './user-role.schema'

import { prisma } from '~/db.server'
import { badRequest } from 'remix-utils'

export const getUserRoles = () => {
  return prisma.userRole.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getUserRoleById = async (id: UserRole['id']) => {
  return prisma.userRole.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createUserRole = async (data: UserRoleInputSchema) => {
  const { name } = data
  return prisma.userRole.create({
    data: { name },
  })
}

export const updateUserRoleById = async (
  id: UserRole['id'],
  data: UserRoleInputSchema
) => {
  const { name } = data
  try {
    return prisma.userRole.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error, no se encontro el ID del rol de usuario'
    )
  }
}

export const deleteUserRoleById = async (id: UserRole['id']) => {
  try {
    const deletedUserRole = await prisma.userRole.delete({
      where: {
        id,
      },
    })
    return deletedUserRole.id
  } catch (e) {
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error, no se encontro el ID del rol de usuario'
    )
  }
}
