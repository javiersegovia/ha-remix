import type { State } from '@prisma/client'
import { prisma } from '~/db.server'

export const getCitiesByStateId = async (stateId: State['id']) => {
  return prisma.city.findMany({
    where: {
      stateId,
    },
    select: {
      id: true,
      name: true,
    },
  })
}
