import { prisma } from '~/db.server'

export const getCurrencies = async () => {
  return prisma.currency.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
