import type { Company } from '@prisma/client'
import type { CompanyPointsSchemaInput } from './company-points.schema'

import { prisma, xprisma } from '~/db.server'

export const getPointsTransactionsByCompanyId = async (
  companyId: Company['id']
) => {
  return xprisma.pointTransaction.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      type: true,
      value: true,
      receiver: {
        select: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
      sender: {
        select: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const getCompanyPointMetricsByCompanyId = async (
  companyId: Company['id']
) => {
  let companyPoints = await prisma.companyPoints.findUnique({
    where: {
      companyId,
    },
    select: {
      id: true,
      updatedAt: true,
      estimatedBudget: true,
      currentBudget: true,
      circulatingPoints: true,
      spentPoints: true,
    },
  })

  if (!companyPoints) {
    companyPoints = await prisma.companyPoints.create({
      data: {
        spentPoints: 0,
        estimatedBudget: 0,
        currentBudget: 0,
        circulatingPoints: 0,
        companyId,
      },
      select: {
        id: true,
        updatedAt: true,
        estimatedBudget: true,
        currentBudget: true,
        circulatingPoints: true,
        spentPoints: true,
      },
    })
  }

  const {
    updatedAt,
    estimatedBudget,
    currentBudget,
    circulatingPoints,
    spentPoints,
  } = companyPoints

  return {
    updatedAt,
    estimatedBudget,
    currentBudget,
    circulatingPoints,
    spentPoints,
  }
}

export const upsertCompanyPoints = async (
  data: CompanyPointsSchemaInput,
  companyId: Company['id']
) => {
  const { estimatedBudget, currentBudget, circulatingPoints, spentPoints } =
    data

  return prisma.companyPoints.upsert({
    where: {
      companyId,
    },
    create: {
      estimatedBudget,
      currentBudget,
      circulatingPoints,
      spentPoints,
      companyId,
    },
    update: {
      estimatedBudget,
      currentBudget,
      circulatingPoints,
      spentPoints,
    },
  })
}
