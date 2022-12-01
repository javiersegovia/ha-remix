import type { BenefitInputSchema } from './benefit.schema'
import { prisma } from '~/db.server'
import { badRequest, notFound } from 'remix-utils'
import type { Benefit } from '@prisma/client'

export const getBenefits = async () => {
  return prisma.benefit.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getBenefitById = async (benefitId: Benefit['id']) => {
  return prisma.benefit.findFirst({
    where: {
      id: benefitId,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createBenefit = async ({ name }: BenefitInputSchema) => {
  try {
    return prisma.benefit.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest(null, {
      statusText: 'Ocurrió un error inesperado al crear el beneficio',
    })
  }
}

export const updateBenefitById = async (
  data: BenefitInputSchema,
  benefitId: Benefit['id']
) => {
  const benefit = await prisma.benefit.findFirst({
    where: {
      id: benefitId,
    },
  })

  if (!benefit) {
    throw notFound(null, {
      statusText: 'No se pudo encontrar el beneficio a actualizar',
    })
  }

  return prisma.benefit.update({
    where: {
      id: benefit.id,
    },
    data: {
      name: data.name,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const deleteBenefitById = async (benefitId: Benefit['id']) => {
  try {
    const deleted = await prisma.benefit.delete({
      where: {
        id: benefitId,
      },
    })

    return deleted.id
  } catch (e) {
    console.error(e)
    throw badRequest(null, {
      statusText: 'Ocurrió un error inesperado al eliminar el beneficio',
    })
  }
}
