import { PointTransactionType, type Company } from '@prisma/client'
import { prisma } from '~/db.server'

export const getPointsTransactionsByCompanyId = async (
  companyId: Company['id']
) => {
  return prisma.pointTransaction.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      updatedAt: true,
      type: true,
      value: true,
      receiver: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      sender: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  })
}

export const calculateCompanyPointMetricsByCompanyId = async (
  companyId: Company['id']
) => {
  let companyPoints = await prisma.companyPoints.findUnique({
    where: {
      companyId,
    },
    select: {
      id: true,
      updatedAt: true,
      spentPoints: true,
      availablePoints: true,
      company: {
        select: {
          pointTransactions: {
            select: {
              id: true,
              type: true,
              value: true,
            },
          },
        },
      },
    },
  })

  if (!companyPoints) {
    companyPoints = await prisma.companyPoints.create({
      data: {
        availablePoints: 0,
        spentPoints: 0,
        companyId,
      },
      select: {
        id: true,
        updatedAt: true,
        spentPoints: true,
        availablePoints: true,
        company: {
          select: {
            pointTransactions: {
              select: {
                id: true,
                type: true,
                value: true,
              },
            },
          },
        },
      },
    })
  }

  let assignedPoints = 0
  let consumedPoints = 0

  const {
    company: { pointTransactions },
    availablePoints,
  } = companyPoints

  for (let i = 0; i < pointTransactions.length; i++) {
    if (pointTransactions[i].type === PointTransactionType.TRANSFER) {
      assignedPoints += pointTransactions[i].value
    } else if (pointTransactions[i].type === PointTransactionType.CONSUMPTION) {
      consumedPoints += pointTransactions[i].value
    }
  }

  return { assignedPoints, consumedPoints, availablePoints }
}
