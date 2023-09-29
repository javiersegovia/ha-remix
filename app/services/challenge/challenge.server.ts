import type {
  Challenge,
  Company,
  Employee,
  IndicatorActivity,
} from '@prisma/client'
import type { ChallengeSchemaInput } from './challenge.schema'

import { prisma } from '~/db.server'
import { connectMany, setMany } from '~/utils/relationships'
import { sanitizeDate } from '~/utils/formatDate'
import { badRequest } from '~/utils/responses'
import { $path } from 'remix-routes'
import { getIndicatorActivitiesByChallengeId } from '../indicator-activity/indicator-activity.server'

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

export const getChallengesWithProgressByCompanyId = async (
  companyId: Company['id']
) => {
  const challenges = await getChallengesByCompanyId(companyId)

  const promises = challenges.map(async (challenge, index) => {
    const indicatorActivities = await getIndicatorActivitiesByChallengeId(
      challenge.id
    )

    const progress = calculateChallengeProgress({
      goal: challenge.goal,
      rewardEligibles: challenge.rewardEligibles,
      indicatorActivities,
    })

    return { ...challenge, progress }
  })

  return Promise.all(promises)
}

export const getChallengeById = (challengeId: Challenge['id']) => {
  return prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    include: {
      teams: true,
      indicator: true,
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

/** If both items belong to the same company, the value will be true */
export const canEmployeeViewChallenge = async (
  challengeId: Challenge['id'],
  employeeId: Employee['id']
) => {
  const findEmployee = prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      companyId: true,
    },
  })

  const findChallenge = prisma.challenge.findUnique({
    where: { id: challengeId },
    select: {
      companyId: true,
    },
  })

  const [employee, challenge] = await Promise.all([findEmployee, findChallenge])

  return employee?.companyId === challenge?.companyId
}

interface CalculateChallengeProgressArgs {
  goal?: Challenge['goal']
  rewardEligibles?: Challenge['rewardEligibles']
  indicatorActivities: Pick<IndicatorActivity, 'value'>[]
}

export const calculateChallengeProgress = ({
  goal,
  rewardEligibles = 1,
  indicatorActivities,
}: CalculateChallengeProgressArgs) => {
  if (!goal) {
    return null
  }

  const progressValue = indicatorActivities.reduce(
    (prev, curr) => prev + curr.value,
    0
  )

  return {
    progressValue,
    progressPercentage: (progressValue * 100) / (goal * rewardEligibles),
  }
}

export const requireEmployeeCanViewChallenge = async (
  challengeId: Challenge['id'],
  employeeId: Employee['id']
) => {
  const hasPermission = await canEmployeeViewChallenge(challengeId, employeeId)

  if (!hasPermission) {
    throw badRequest({
      message: `No estás autorizado para realizar esta acción`,
      redirect: $path('/unauthorized'),
    })
  }
}
