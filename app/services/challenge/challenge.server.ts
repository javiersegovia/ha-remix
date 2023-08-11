import type { Challenge, Company } from '@prisma/client'
import type { ChallengeSchemaInput } from './challenge.schema'

import { prisma } from '~/db.server'
import { connectMany, setMany } from '~/utils/relationships'
import { sanitizeDate } from '~/utils/formatDate'

export const getChallengesByCompanyId = (companyId: Company['id']) => {
  return prisma.challenge.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      teams: true,
      indicator: true,
    },
  })
}

export const getChallengeById = (challengeId: Challenge['id']) => {
  return prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    include: {
      teams: true,
    },
  })
}

export const createChallenge = (
  data: ChallengeSchemaInput,
  companyId: Company['id']
) => {
  const { teamIds, ...challengeData } = data

  return prisma.challenge.create({
    data: {
      ...challengeData,
      teams: connectMany(teamIds),
      companyId,
    },
  })
}

export const updateChallengeById = (
  data: ChallengeSchemaInput,
  challengeId: Challenge['id']
) => {
  const { teamIds, startDate, finishDate, ...challengeData } = data

  return prisma.challenge.update({
    where: {
      id: challengeId,
    },
    data: {
      ...challengeData,
      startDate: sanitizeDate(startDate) || null,
      finishDate: sanitizeDate(finishDate) || null,
      teams: setMany(teamIds),
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
