import type {
  Challenge,
  Company,
  Employee,
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
    orderBy: {
      date: 'asc',
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

export interface EmployeeIndicatorActivity {
  employeeId: Employee['id']
  fullName: string
  email: string
  fulfillmentDate: Date | null
  totalActivityValue: number
  indicator: Pick<Indicator, 'name'>
  indicatorActivities: Pick<IndicatorActivity, 'date' | 'id' | 'value'>[]
}

interface GetEmployeeIndicatorActivitiesArgs {
  goal: number
  indicatorActivities: Awaited<
    ReturnType<typeof getIndicatorActivitiesByChallengeId>
  >
}

export const getEmployeeIndicatorActivities = ({
  indicatorActivities,
  goal,
}: GetEmployeeIndicatorActivitiesArgs) => {
  const employeesIActivities: Record<
    Employee['id'],
    EmployeeIndicatorActivity
  > = {}

  for (let iActivity of indicatorActivities) {
    const { date, value, id, employee, indicator } = iActivity

    if (employeesIActivities[employee.id]) {
      const newTotalActivityValue =
        employeesIActivities[employee.id].totalActivityValue + value

      employeesIActivities[employee.id] = {
        ...employeesIActivities[employee.id],

        totalActivityValue: newTotalActivityValue,

        fulfillmentDate:
          !employeesIActivities[employee.id].fulfillmentDate &&
          newTotalActivityValue >= goal
            ? date
            : employeesIActivities[employee.id].fulfillmentDate,

        indicatorActivities: [
          ...employeesIActivities[employee.id].indicatorActivities,
          {
            id,
            date,
            value,
          },
        ],
      }
    } else {
      employeesIActivities[employee.id] = {
        employeeId: employee.id,
        email: employee.user.email,
        fullName: employee.user.fullName,
        totalActivityValue: value,
        fulfillmentDate: value >= goal ? date : null,
        indicator,
        indicatorActivities: [{ id, date, value }],
      }
    }
  }

  const employees = Object.values(employeesIActivities).sort((a, b) => {
    if (a.fulfillmentDate === null) {
      return 1
    }

    if (b.fulfillmentDate === null) {
      return -1
    }

    if (a.fulfillmentDate.getTime() === b.fulfillmentDate.getTime()) {
      return a.totalActivityValue < b.totalActivityValue ? 1 : -1
    }

    return a.fulfillmentDate < b.fulfillmentDate ? -1 : 1
  })

  return employees
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
