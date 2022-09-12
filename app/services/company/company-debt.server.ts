import { prisma } from '~/db.server'

export const getCompanyDebtsByCompanyId = (companyId: string) => {
  return prisma.companyDebt.findMany({
    where: {
      companyId,
    },
    orderBy: [
      {
        month: 'asc',
      },
      {
        year: 'asc',
      },
    ],
    // todo: select only required values
    include: {
      fiatDebt: {
        include: {
          _count: {
            select: {
              payrollAdvances: true,
            },
          },
        },
      },
      cryptoDebt: {
        include: {
          _count: {
            select: {
              payrollAdvances: true,
            },
          },
        },
      },
    },
  })
}
