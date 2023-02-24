import type { Benefit } from '@prisma/client'
import { prisma } from '~/db.server'

export const getEmployeeEnabledBenefits = async (
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
    select: {
      id: true,
      slug: true,
      buttonHref: true,
      buttonText: true,
      name: true,
      mainImage: {
        select: {
          id: true,
          url: true,
        },
      },
      benefitHighlight: {
        select: {
          id: true,
          buttonHref: true,
          buttonText: true,
          description: true,
          title: true,
          isActive: true,
          image: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      },
      benefitCategory: {
        select: {
          id: true,
          name: true,
          hexColor: true,
          opacity: true,
        },
      },
    },
  })
}
