import type { Gender } from '@prisma/client'
import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'
import type { GenderInputSchema } from './gender.schema'

export const getGenders = () => {
  return prisma.gender.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getGenderById = async (id: Gender['id']) => {
  return prisma.gender.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createGender = async (data: GenderInputSchema) => {
  const { name } = data
  return prisma.gender.create({
    data: { name },
  })
}

export const updateGenderById = async (
  id: Gender['id'],
  data: GenderInputSchema
) => {
  const { name } = data
  try {
    return prisma.gender.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error, no se encontró el ID del género',
      redirect: null,
    })
  }
}

export const deleteGenderById = async (id: Gender['id']) => {
  try {
    const deletedGender = await prisma.gender.delete({
      where: {
        id,
      },
    })
    return deletedGender.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error, no se encontró el ID del género',
      redirect: null,
    })
  }
}
