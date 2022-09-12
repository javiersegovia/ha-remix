import { prisma } from '~/db.server'

export const getJobPositions = async () => {
  return prisma.jobPosition.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
