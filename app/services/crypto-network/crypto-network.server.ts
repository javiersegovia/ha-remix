import { prisma } from '~/db.server'

export const getCryptoNetworks = async () => {
  return prisma.cryptoNetwork.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
