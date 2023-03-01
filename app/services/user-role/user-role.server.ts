import type { PermissionCode, UserRole } from '@prisma/client'
import type { UserRoleInputSchema } from './user-role.schema'

import { prisma } from '~/db.server'
import { badRequest } from '~/utils/responses'

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
      permissions: {
        select: {
          id: true,
          code: true,
        },
      },
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
    throw badRequest({
      message: 'Ha ocurrido un error al actualizar el rol de usuario',
      redirect: null,
    })
  }
}

export const updateUserRolePermissionsById = async (
  roleId: UserRole['id'],
  permissionCodes: PermissionCode[]
) => {
  return prisma.userRole.update({
    where: {
      id: roleId,
    },
    data: {
      permissions: {
        set: permissionCodes.map((code) => ({ code })),
      },
    },
  })
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
    throw badRequest({
      message: 'Ha ocurrido un error al eliminar el rol de usuario',
      redirect: null,
    })
  }
}
