import { prisma } from '~/db.server'

export const getBankAccountTypes = () => {
  return prisma.bankAccountType.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
