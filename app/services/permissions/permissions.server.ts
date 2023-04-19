import type {
  Benefit,
  CompanyBenefit,
  PermissionCode,
  User,
  UserRole,
} from '@prisma/client'
import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'
import { defaultPermissions } from './permissions.list'

interface GetEmployeeEnabledBenefitsArgs {
  employeeBenefits:
    | (Pick<Benefit, 'id'> & {
        companyBenefit: Pick<CompanyBenefit, 'id'> | null
      })[]
    | undefined

  membershipBenefits: Pick<Benefit, 'id'>[] | undefined
  companyBenefits: Pick<Benefit, 'id'>[] | undefined
  employeeGroupsBenefits:
    | (Pick<Benefit, 'id'> & {
        companyBenefit: Pick<CompanyBenefit, 'id'> | null
      })[]
    | undefined
}

/** employeeBenefits refer to the benefits assigned directly to the employee.
 *  membershipBenefits refer to the benefits assigned to a membership.
 *  companyBenefits refer to the benefits assigned to the company and determine whether a global benefit can be used or not.
 *  employeeGroupsBenefits refer to the benefits that belong to the employee groups.
 */

export const getEmployeeEnabledBenefits = async ({
  employeeBenefits,
  membershipBenefits,
  companyBenefits,
  employeeGroupsBenefits,
}: GetEmployeeEnabledBenefitsArgs) => {
  const membershipBenefitsIds = membershipBenefits?.map((m) => m.id) || []
  const companyEnabledBenefitsIds = companyBenefits?.map((c) => c.id) || []

  const unfilteredBenefits = [
    ...(employeeBenefits || []),
    ...(employeeGroupsBenefits || []),
  ]

  const employeeBenefitsIds: Benefit['id'][] = []
  const employeeCompanyBenefitsIds: Benefit['id'][] = []
  // employeeCompanyBenefitsIds refers to the benefits that were created by the company. Those benefits don't have any restriction.

  for (const benefit of unfilteredBenefits) {
    if (benefit.companyBenefit) {
      employeeCompanyBenefitsIds.push(benefit.id)
    } else {
      employeeBenefitsIds.push(benefit.id)
    }
  }

  const benefitsIds = [...membershipBenefitsIds, ...employeeBenefitsIds].filter(
    (id) => companyEnabledBenefitsIds.includes(id)
  )

  return await prisma.benefit.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      id: {
        in: [...benefitsIds, ...employeeCompanyBenefitsIds],
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
