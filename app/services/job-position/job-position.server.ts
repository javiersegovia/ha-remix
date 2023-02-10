import type { JobPosition } from '@prisma/client'
import type { JobPositionInputSchema } from './job-position.schema'

import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'

export const getJobPositions = async () => {
  return prisma.jobPosition.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}

export const getJobPositionById = async (id: JobPosition['id']) => {
  return prisma.jobPosition.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createJobPosition = async (data: JobPositionInputSchema) => {
  const { name } = data
  return prisma.jobPosition.create({
    data: { name },
  })
}

export const updateJobPositionById = async (
  id: JobPosition['id'],
  data: JobPositionInputSchema
) => {
  const { name } = data
  try {
    return prisma.jobPosition.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID de la categoría de trabajo')
  }
}

export const deleteJobPositionById = async (id: JobPosition['id']) => {
  try {
    const deletedjobPosition = await prisma.jobPosition.delete({
      where: {
        id,
      },
    })

    return deletedjobPosition.id
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID de la categoría de trabajo')
  }
}
