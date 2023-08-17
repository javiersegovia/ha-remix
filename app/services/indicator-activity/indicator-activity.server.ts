import type { Indicator, IndicatorActivity } from '@prisma/client'
import type { IndicatorActivitySchemaInput } from './indicator-activity.schema'
import { prisma, xprisma } from '~/db.server'

export const getIndicatorActivitiesByIndicatorId = async (
  indicatorId: Indicator['id']
) => {
  return xprisma.indicatorActivity.findMany({
    where: {
      indicatorId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      value: true,
      date: true,
      employee: {
        select: {
          user: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      },
    },
  })
}

export const getIndicatorActivityById = async (
  indicatorActivityId: IndicatorActivity['id']
) => {
  return xprisma.indicatorActivity.findUnique({
    where: {
      id: indicatorActivityId,
    },
    select: {
      id: true,
      value: true,
      date: true,
      employee: {
        select: {
          id: true,
          user: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      },
    },
  })
}

export const createIndicatorActivity = (
  data: IndicatorActivitySchemaInput,
  indicatorId: Indicator['id']
) => {
  const { value, date, employeeId } = data

  return prisma.indicatorActivity.create({
    data: {
      value,
      date: date as Date,
      employeeId,
      indicatorId,
    },
  })
}

export const updateIndicatorActivityById = (
  data: IndicatorActivitySchemaInput,
  indicatorActivityId: Indicator['id']
) => {
  const { value, date, employeeId } = data

  return prisma.indicatorActivity.update({
    where: {
      id: indicatorActivityId,
    },
    data: {
      value,
      date: date as Date,
      employeeId,
    },
  })
}

export const deleteIndicatorActivityById = async (
  indicatorActivityId: IndicatorActivity['id']
) => {
  return prisma.indicatorActivity.delete({
    where: {
      id: indicatorActivityId,
    },
  })
}
