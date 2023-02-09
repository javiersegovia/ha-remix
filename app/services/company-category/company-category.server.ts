import type { CompanyCategory } from '@prisma/client'
import { prisma } from '~/db.server'
import type { CompanyCategoryInputSchema } from './company-category.schema'
import { badRequest } from 'remix-utils'

export const getCompanyCategories = () => {
  return prisma.companyCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getCompanyCategoryById = async (id: CompanyCategory['id']) => {
  return prisma.companyCategory.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createCompanyCategory = async (
  data: CompanyCategoryInputSchema
) => {
  const { name } = data
  return prisma.companyCategory.create({
    data: { name },
  })
}

export const updateCompanyCategoryById = async (
  id: CompanyCategory['id'],
  data: CompanyCategoryInputSchema
) => {
  const { name } = data
  try {
    return prisma.companyCategory.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error, no se encontro el ID de la categoría de la compañía'
    )
  }
}

export const deleteCompanyCategoryById = async (id: CompanyCategory['id']) => {
  try {
    const deletedCompanyCategory = await prisma.companyCategory.delete({
      where: {
        id,
      },
    })
    return deletedCompanyCategory.id
  } catch (e) {
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error, no se encontro el ID de la categoría de la compañía'
    )
  }
}
