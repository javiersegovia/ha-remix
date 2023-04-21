import type { SalaryRange } from '@prisma/client'
import type { SalaryRangeInputSchema } from './salary-range.schema'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

export const getSalaryRanges = () => {
  return prisma.salaryRange.findMany({
    select: {
      id: true,
      minValue: true,
      maxValue: true,
    },
    orderBy: {
      minValue: 'asc',
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
      minValue: true,
      maxValue: true,
    },
  })
}

export const createSalaryRange = async (data: SalaryRangeInputSchema) => {
  const { minValue, maxValue } = data
  return prisma.salaryRange.create({
    data: { minValue, maxValue },
  })
}

export const updateSalaryRangeById = async (
  id: SalaryRange['id'],
  data: SalaryRangeInputSchema
) => {
  const { minValue, maxValue } = data
  try {
    return prisma.salaryRange.update({
      where: {
        id,
      },
      data: { minValue, maxValue },
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
