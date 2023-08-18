import type { Company, Indicator, IndicatorActivity } from '@prisma/client'
import type {
  ExtendedIndicatorActivitySchemaInput,
  IndicatorActivitySchemaInput,
} from './indicator-activity.schema'
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
export const getIndicatorActivitiesByCompanyId = async (
  companyId: Company['id']
) => {
  return xprisma.indicatorActivity.findMany({
    where: {
      employee: {
        companyId,
      },
    },
    orderBy: {
      date: 'desc',
    },
    select: {
      id: true,
      value: true,
      date: true,
      indicator: {
        select: {
          name: true,
        },
      },
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
      indicatorId: true,
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
  data: IndicatorActivitySchemaInput | ExtendedIndicatorActivitySchemaInput,
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
      indicatorId: 'indicatorId' in data ? data.indicatorId : undefined,
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
