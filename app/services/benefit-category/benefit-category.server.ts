import type { BenefitCategory, Company } from '@prisma/client'
import { badRequest } from '~/utils/responses'

import { prisma } from '~/db.server'
import type { BenefitCategoryInputSchema } from './benefit-category.schema'
import { connect } from '~/utils/relationships'

export const getBenefitCategoriesWithoutCompanies = async () => {
  return prisma.benefitCategory.findMany({
    where: {
      companyBenefitCategory: null,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getBenefitCategoriesByCompanyId = async (
  companyId: Company['id']
) => {
  return prisma.benefitCategory.findMany({
    where: {
      companyBenefitCategory: {
        companyId,
      },
    },
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
  const { hexColor, opacity, name } = data
  try {
    return prisma.benefitCategory.update({
      where: {
        id,
      },
      data: {
        name,
        hexColor: hexColor || null,
        opacity: opacity || null,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'No se encontró el ID de la categoría de beneficio',
      redirect: null,
    })
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
    throw badRequest({
      message: 'No se pudo eliminar la categoría de beneficio',
      redirect: null,
    })
  }
}

export const createCompanyBenefitCategory = async (
  data: BenefitCategoryInputSchema,
  companyId: Company['id']
) => {
  return prisma.companyBenefitCategory.create({
    data: {
      benefitCategory: {
        create: data,
      },
      company: connect(companyId),
    },
  })
}
