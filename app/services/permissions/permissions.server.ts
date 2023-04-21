import type { Benefit, PermissionCode, User, UserRole } from '@prisma/client'
import type { FilterEmployeeEnabledBenefitsArgs } from './permissions.shared'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'
import { defaultPermissions } from './permissions.list'
import { filterEmployeeEnabledBenefits } from './permissions.shared'

/** employeeBenefits refer to the benefits assigned directly to the employee.
 *  membershipBenefits refer to the benefits assigned to a membership.
 *  companyBenefits refer to the benefits assigned to the company and determine whether a global benefit can be used or not.
 *  employeeGroupsBenefits refer to the benefits that belong to the employee groups.
 */

type GetEmployeeEnabledBenefitsArgs = Pick<
  FilterEmployeeEnabledBenefitsArgs,
  'employeeBenefits' | 'membershipBenefits' | 'employeeGroupsBenefits'
> & {
  companyBenefits: Pick<Benefit, 'id'>[] | undefined
}

export const getEmployeeEnabledBenefits = async ({
  employeeBenefits,
  membershipBenefits,
  employeeGroupsBenefits,
  companyBenefits,
}: GetEmployeeEnabledBenefitsArgs) => {
  const filteredBenefits = filterEmployeeEnabledBenefits({
    employeeBenefits,
    membershipBenefits,
    employeeGroupsBenefits,
    companyBenefitsIds: companyBenefits?.map((b) => b.id),
  })

  return await prisma.benefit.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      id: {
        in: filteredBenefits.map((b) => b.id),
      },
    },
    select: {
      id: true,
      slug: true,
      buttonHref: true,
      buttonText: true,
      name: true,
      mainImage: {
        select: {
          id: true,
          url: true,
        },
      },
      benefitHighlight: {
        select: {
          id: true,
          buttonHref: true,
          buttonText: true,
          description: true,
          title: true,
          isActive: true,
          image: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      },
      benefitCategory: {
        select: {
          id: true,
          name: true,
          hexColor: true,
          opacity: true,
        },
      },
    },
  })
}

export const findOrCreatePermissionByCode = async (code: PermissionCode) => {
  const permission = defaultPermissions.find((p) => p.code === code)

  if (!permission) {
    throw badRequest({
      message: `Permiso de código ${code} no encontrado`,
      redirect: null,
    })
  }

  return await prisma.permission.upsert({
    where: {
      code,
    },
    update: {},
    create: {
      ...permission,
    },
  })
}

export const findOrCreateManyPermissions = async () => {
  await deleteUnusedPermissions()

  const promises = defaultPermissions.map(async (p) => {
    return await prisma.permission.upsert({
      where: {
        code: p.code,
      },
      update: {},
      create: {
        ...p,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
    })
  })

  return Promise.all(promises)
}

export const deleteUnusedPermissions = () => {
  return prisma.permission.deleteMany({
    where: {
      NOT: {
        code: {
          in: defaultPermissions.map((p) => p.code),
        },
      },
    },
  })
}

export const hasPermissionByUserRoleId = async (
  roleId: UserRole['id'],
  permissionCode: PermissionCode
) => {
  const role = await prisma.userRole.findUnique({
    where: {
      id: roleId,
    },
    select: {
      permissions: {
        select: {
          code: true,
        },
      },
    },
  })

  if (!role) {
    throw badRequest({
      message: `Rol con ID ${roleId} no encontrado`,
      redirect: null,
    })
  }

  return role.permissions.some((p) => p.code === permissionCode)
}

export const hasPermissionByUserId = async (
  userId: User['id'],
  permissionCode: PermissionCode
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: {
        select: {
          permissions: {
            select: {
              code: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw badRequest({
      message: `Usuario con ID ${userId} no encontrado`,
      redirect: null,
    })
  }

  return Boolean(user.role?.permissions.some((p) => p.code === permissionCode))
}

export const requirePermissionByUserRoleId = async (
  roleId: UserRole['id'],
  permissionCode: PermissionCode
) => {
  const hasPermission = await hasPermissionByUserRoleId(roleId, permissionCode)
  if (!hasPermission) {
    throw badRequest({
      message: `No estás autorizado para realizar esta acción`,
      redirect: '/unauthorized',
    })
  }
}

export const requirePermissionByUserId = async (
  userId: User['id'],
  permissionCode: PermissionCode
) => {
  const hasPermission = await hasPermissionByUserId(userId, permissionCode)
  if (!hasPermission) {
    throw badRequest({
      message: `No estás autorizado para realizar esta acción`,
      redirect: '/unauthorized',
    })
  }
}
