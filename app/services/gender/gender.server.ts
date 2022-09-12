import { prisma } from '~/db.server'

export const getGenders = () => {
  return prisma.gender.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
