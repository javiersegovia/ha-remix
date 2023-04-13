import type { SalaryRange } from '@prisma/client'
import type { SalaryRangeInputSchema } from './salary-range.schema'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

export const getSalaryRanges = () => {
  return prisma.salaryRange.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getSalaryRangeById = async (id: SalaryRange['id']) => {
  return prisma.salaryRange.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createSalaryRange = async (data: SalaryRangeInputSchema) => {
  const { name } = data
  return prisma.salaryRange.create({
    data: { name },
  })
}

export const updateSalaryRangeById = async (
  id: SalaryRange['id'],
  data: SalaryRangeInputSchema
) => {
  const { name } = data
  try {
    return prisma.salaryRange.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Hubo error al actualizar el rango salarial',
      redirect: null,
    })
  }
}

export const deleteSalaryRangeById = async (id: SalaryRange['id']) => {
  try {
    const deletedSalaryRange = await prisma.salaryRange.delete({
      where: {
        id,
      },
    })

    return deletedSalaryRange.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Hubo un error al eliminar el rango salarial',
      redirect: null,
    })
  }
}
