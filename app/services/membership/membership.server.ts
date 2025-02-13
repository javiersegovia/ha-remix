import type { MembershipInputSchema } from './membership.schema'
import { prisma } from '~/db.server'
import { badRequest, notFound } from '~/utils/responses'
import type { Membership, Prisma } from '@prisma/client'
import { connectMany, setMany } from '~/utils/relationships'

export const getMemberships = async (
  options?: Pick<Prisma.MembershipFindManyArgs, 'take' | 'skip' | 'cursor'>
) => {
  const { take, skip } = options || {}
  return prisma.membership.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          benefits: true,
          employees: true,
        },
      },
    },
    take,
    skip,
    orderBy: {
      name: 'asc',
    },
  })
}

export const getMembershipById = async (membershipId: Membership['id']) => {
  return prisma.membership.findFirst({
    where: {
      id: membershipId,
    },
    select: {
      id: true,
      name: true,
      benefits: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export const createMembership = async ({
  name,
  benefitsIds,
}: MembershipInputSchema) => {
  try {
    return prisma.membership.create({
      data: {
        name,
        benefits: connectMany(benefitsIds),
      },
      select: {
        id: true,
        name: true,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ocurrió un error inesperado al crear la membresía',
      redirect: null,
    })
  }
}

export const updateMembershipById = async (
  data: MembershipInputSchema,
  membershipId: Membership['id']
) => {
  const membership = await prisma.membership.findFirst({
    where: {
      id: membershipId,
    },
  })

  if (!membership) {
    throw notFound({
      message: 'No se pudo encontrar la membresía a actualizar',
      redirect: null,
    })
  }

  return prisma.membership.update({
    where: {
      id: membership.id,
    },
    data: {
      name: data.name,
      benefits: setMany(data.benefitsIds),
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const deleteMembershipById = async (membershipId: Membership['id']) => {
  try {
    const deleted = await prisma.membership.delete({
      where: {
        id: membershipId,
      },
    })

    return deleted.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ocurrió un error inesperado al eliminar la membresía',
      redirect: null,
    })
  }
}
