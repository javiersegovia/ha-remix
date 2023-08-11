import type { Indicator, IndicatorActivity } from '@prisma/client'
import { xprisma } from '~/db.server'

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
