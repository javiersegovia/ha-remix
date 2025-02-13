import type { PermissionCode, User, UserRole } from '@prisma/client'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'
import { defaultPermissions } from './permissions.list'
import { filterEmployeeEnabledBenefits } from './permissions.shared'

/** employeeBenefits refer to the benefits assigned directly to the employee.
 *  membershipBenefits refer to the benefits assigned to a membership.
 *  companyBenefits refer to the benefits assigned to the company and determine whether a global benefit can be used or not.
 *  employeeGroupsBenefits refer to the benefits that belong to the employee groups.
 */

export const getEmployeeEnabledBenefits = async (userId: User['id']) => {
  const employee = await prisma.employee.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
    select: {
      availablePoints: true,

      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },

      company: {
        select: {
          name: true,
          description: true,
          logoImage: {
            select: {
              url: true,
            },
          },
          benefits: {
            select: {
              id: true,
            },
          },
        },
      },
      benefits: {
        select: {
          id: true,
          companyBenefit: {
            select: {
              id: true,
            },
          },
        },
      },
      employeeGroups: {
        select: {
          id: true,
          benefits: {
            select: {
              id: true,
              companyBenefit: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      membership: {
        select: { id: true, name: true, benefits: { select: { id: true } } },
      },
    },
  })

  const filteredBenefitsIds = filterEmployeeEnabledBenefits({
    employeeBenefits: employee?.benefits,
    membershipBenefits: employee?.membership?.benefits,
    companyBenefitsIds: employee?.company.benefits?.map((b) => b.id),
    employeeGroupsBenefits: employee?.employeeGroups
      ?.map((eGroup) => eGroup.benefits)
      .flat(),
  })

  return await prisma.benefit.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      id: {
        in: [...filteredBenefitsIds],
      },
    },
    select: {
      id: true,
      slug: true,
      buttonHref: true,
      buttonText: true,
      name: true,
      isHighlighted: true,
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
