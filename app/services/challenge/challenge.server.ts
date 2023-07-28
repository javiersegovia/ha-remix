import type { Challenge, Company } from '@prisma/client'
import type { ChallengeSchemaInput } from './challenge.schema'

import { prisma } from '~/db.server'

export const getChallengesByCompanyId = (companyId: Company['id']) => {
  return prisma.challenge.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const getChallengeById = (challengeId: Challenge['id']) => {
  return prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
  })
}

export const createChallenge = (
  data: ChallengeSchemaInput,
  companyId: Company['id']
) => {
  return prisma.challenge.create({
    data: {
      ...data,
      companyId,
    },
  })
}

export const updateChallengeById = (
  data: ChallengeSchemaInput,
  challengeId: Challenge['id']
) => {
  return prisma.challenge.update({
    where: {
      id: challengeId,
    },
    data: {
      ...data,
    },
  })
}

export const deleteChallengeById = (challengeId: Challenge['id']) => {
  return prisma.challenge.delete({
    where: {
      id: challengeId,
    },
  })
}
