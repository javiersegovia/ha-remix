import { prisma } from '~/db.server'

export const getCountries = () => {
  return prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  })
}
