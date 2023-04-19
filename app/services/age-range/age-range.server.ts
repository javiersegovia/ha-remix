import type { AgeRange } from '@prisma/client'
import type { AgeRangeInputSchema } from './age-range.schema'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

export const getAgeRanges = () => {
  return prisma.ageRange.findMany({
    select: {
      id: true,
      minAge: true,
      maxAge: true,
    },
    orderBy: {
      minAge: 'asc',
    },
  })
}

export const getAgeRangeById = async (id: AgeRange['id']) => {
  return prisma.ageRange.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      minAge: true,
      maxAge: true,
    },
  })
}

export const createAgeRange = async (data: AgeRangeInputSchema) => {
  const { minAge, maxAge } = data
  return prisma.ageRange.create({
    data: { minAge, maxAge },
  })
}

export const updateAgeRangeById = async (
  id: AgeRange['id'],
  data: AgeRangeInputSchema
) => {
  const { minAge, maxAge } = data
  try {
    return prisma.ageRange.update({
      where: {
        id,
      },
      data: { minAge, maxAge },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Hubo un error al actualizar el rango de edad',
      redirect: null,
    })
  }
}

export const deleteAgeRangeById = async (id: AgeRange['id']) => {
  try {
    const deletedAgeRange = await prisma.ageRange.delete({
      where: {
        id,
      },
    })
    return deletedAgeRange.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error al eliminar el rango de edad',
      redirect: null,
    })
  }
}
