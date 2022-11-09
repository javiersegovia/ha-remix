import { prisma } from '~/db.server'

export const getBenefits = async () => {
  return prisma.benefit.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}
