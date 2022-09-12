import type { Country } from '@prisma/client'
import { prisma } from '~/db.server'

export const getStatesByCountryId = async (countryId: Country['id']) => {
  return prisma.state.findMany({
    where: {
      countryId,
    },
    select: {
      id: true,
      name: true,
    },
  })
}
