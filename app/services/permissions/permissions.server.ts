import type { Benefit, PermissionCode, User, UserRole } from '@prisma/client'
import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'
import { defaultPermissions } from './permissions.list'

export const getEmployeeEnabledBenefits = async (
  membershipBenefits?: Pick<Benefit, 'id'>[],
  companyBenefits?: Pick<Benefit, 'id'>[]
) => {
  const membershipBenefitsIds = membershipBenefits?.map((m) => m.id) || []
  const companyBenefitsIds = companyBenefits?.map((c) => c.id) || []

  const benefitsIds = membershipBenefitsIds.filter((id) =>
    companyBenefitsIds.includes(id)
  )

  return await prisma.benefit.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      id: {
        in: benefitsIds,
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

  if (!permission) throw badRequest(`Permission with code ${code} not found`)

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

  if (!role) throw badRequest(`Role with id ${roleId} not found`)

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

  if (!user) throw badRequest(`User with id ${userId} not found`)

  return user.role?.permissions.some((p) => p.code === permissionCode)
}

export const requirePermissionByUserRoleId = async (
  roleId: UserRole['id'],
  permissionCode: PermissionCode
) => {
  const hasPermission = await hasPermissionByUserRoleId(roleId, permissionCode)
  if (!hasPermission) {
    throw badRequest(`No estás autorizado para realizar esta acción`)
  }
}

export const requirePermissionByUserId = async (
  userId: User['id'],
  permissionCode: PermissionCode
) => {
  const hasPermission = await hasPermissionByUserId(userId, permissionCode)
  if (!hasPermission) {
    throw badRequest(`No estás autorizado para realizar esta acción`)
  }
}
