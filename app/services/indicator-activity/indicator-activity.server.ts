import type {
  Challenge,
  Company,
  Indicator,
  IndicatorActivity,
  Prisma,
} from '@prisma/client'
import type {
  ExtendedIndicatorActivitySchemaInput,
  IndicatorActivitySchemaInput,
} from './indicator-activity.schema'
import { prisma, xprisma } from '~/db.server'
import { badRequest } from '~/utils/responses'
import { $path } from 'remix-routes'

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

export const getIndicatorActivitiesByChallengeId = async (
  challengeId: Challenge['id']
) => {
  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    select: {
      companyId: true,
      startDate: true,
      finishDate: true,
      teams: {
        select: {
          id: true,
        },
      },
      indicator: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!challenge) {
    throw badRequest({
      message: 'No se pudo encontrar el reto',
      redirect: $path('/home'),
    })
  }

  const indicatorActivityFilters: Prisma.Enumerable<Prisma.IndicatorActivityWhereInput> =
    [
      {
        employee: {
          companyId: challenge.companyId,
        },
      },
    ]

  if (challenge.indicator?.id) {
    indicatorActivityFilters.push({
      indicatorId: challenge.indicator.id,
    })
  }

  if (challenge.startDate || challenge.finishDate) {
    indicatorActivityFilters.push({
      date: {
        gte: challenge.startDate || undefined,
        lte: challenge.finishDate || undefined,
      },
    })
  }

  if (challenge.teams?.length > 0) {
    indicatorActivityFilters.push({
      employee: {
        teamMembers: {
          some: {
            teamId: {
              in: challenge.teams.map((t) => t.id),
            },
          },
        },
      },
    })
  }

  const indicatorActivities = await xprisma.indicatorActivity.findMany({
    where: {
      AND: indicatorActivityFilters,
    },
    select: {
      id: true,
      date: true,
      value: true,
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
      indicator: {
        select: {
          name: true,
        },
      },
    },
  })

  return indicatorActivities
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
