import { prisma } from '~/db.server'

export const getCryptocurrencies = async () => {
  return prisma.cryptocurrency.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
