import type { Team } from '@prisma/client'
import type { MeasurerInputSchema } from './measurer.schema'

import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'

export const getMeasures = () => {
  return prisma.measurer.findMany({
    select: {
      id: true,
      name: true,
      value: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getMeasurerById = async (id: Measurer['id']) => {
  return prisma.measurer.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      value: true,
    },
  })
}

export const createMeasurer = async (
  data: MeasurerInputSchema,
  teamId: Team['id']
) => {
  const { name, value } = data

  try {
    return prisma.measurer.create({
      data: {
        name,
        value,
        teamId,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error en la creación del medidor',
      redirect: null,
    })
  }
}

export const updateMeasurerById = async (
  data: MeasurerInputSchema,
  id: Measurer['id']
) => {
  const { name, value } = data

  try {
    return prisma.measurer.update({
      where: {
        id,
      },
      data: {
        name,
        value,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error durante la actualización del medidor',
      redirect: null,
    })
  }
}

export const deleteMeasurerById = async (id: Measurer['id']) => {
  try {
    return prisma.measurer.delete({
      where: {
        id,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'No se pudo eliminar el medidor',
      redirect: null,
    })
  }
}
