import { prisma } from '~/db.server'

export const getCompanyCategories = () => {
  return prisma.companyCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}
