import type { BenefitCategory } from '@prisma/client'
import { badRequest } from 'remix-utils'

import { prisma } from '~/db.server'
import type { BenefitCategoryInputSchema } from './benefit-category.schema'

export const getBenefitCategories = async () => {
  return prisma.benefitCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getBenefitCategoryById = async (id: BenefitCategory['id']) => {
  return prisma.benefitCategory.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      hexColor: true,
      opacity: true,
    },
  })
}

export const createBenefitCategory = async (
  data: BenefitCategoryInputSchema
) => {
  return prisma.benefitCategory.create({
    data,
  })
}

export const updateBenefitCategoryById = async (
  id: BenefitCategory['id'],
  data: BenefitCategoryInputSchema
) => {
  try {
    return prisma.benefitCategory.update({
      where: {
        id,
      },
      data,
    })
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID de la categoría de beneficio')
  }
}

export const deleteBenefitCategoryById = async (id: BenefitCategory['id']) => {
  try {
    const deletedBenefitCategory = await prisma.benefitCategory.delete({
      where: {
        id,
      },
    })

    return deletedBenefitCategory.id
  } catch (e) {
    console.error(e)
    throw badRequest('No se pudo eliminar la categoría de beneficio')
  }
}
