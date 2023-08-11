import type { Indicator } from '@prisma/client'
import type { IndicatorSchemaInput } from './indicator.schema'

import { prisma } from '~/db.server'

export const getIndicators = async () => {
  return prisma.indicator.findMany({
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getIndicatorById = async (id: Indicator['id']) => {
  return prisma.indicator.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
  })
}

export const createIndicator = async (data: IndicatorSchemaInput) => {
  return prisma.indicator.create({
    data,
  })
}

export const updateIndicatorById = async (
  data: IndicatorSchemaInput,
  indicatorId: Indicator['id']
) => {
  return prisma.indicator.update({
    where: {
      id: indicatorId,
    },
    data,
  })
}

export const deleteIndicatorById = async (indicatorId: Indicator['id']) => {
  return prisma.indicator.delete({
    where: {
      id: indicatorId,
    },
  })
}
