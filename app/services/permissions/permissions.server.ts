import type { Benefit } from '@prisma/client'
import { prisma } from '~/db.server'

export const canUseBenefit = async (
  membershipBenefits?: Pick<Benefit, 'id'>[],
  companyBenefits?: Pick<Benefit, 'id'>[]
) => {
  const membershipBenefitsIds = membershipBenefits?.map((m) => m.id) || []
  const companyBenefitsIds = companyBenefits?.map((c) => c.id) || []

  const benefitsIds = membershipBenefitsIds.filter((id) =>
    companyBenefitsIds.includes(id)
  )

  return await prisma.benefit.findMany({
    orderBy: {
      name: 'asc',
    },
    where: {
      id: {
        in: benefitsIds,
      },
    },
  })
}
