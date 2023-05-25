import type { Benefit, CompanyBenefit } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { CompanyFactory } from '../company/company.factory'

type ExtendedBenefit = Benefit & {
  companyBenefit: Pick<CompanyBenefit, 'id'> | null
}

export const BenefitFactory = Factory.define<ExtendedBenefit>(
  ({ onCreate, associations, sequence }) => {
    onCreate((benefit) => {
      const { id: _, ...benefitData } = benefit

      return prisma.benefit.create({
        data: {
          ...benefitData,

          companyBenefit: connect(associations?.companyBenefit?.id),
        },
        include: {
          companyBenefit: true,
          membership: true,
        },
      })
    })

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.commerce.productName(),
      imageUrl: null,
      buttonHref: faker.internet.url(),
      buttonText: faker.datatype.string(),
      slug: faker.datatype.string(),
      isHighlighted: false,

      companyBenefit: associations?.companyBenefit || null,

      benefitCategoryId: null,
      description: null,
      shortDescription: null,
      instructions: [],
      mainImageId: null,
    }
  }
)

export const CompanyBenefitFactory = Factory.define<CompanyBenefit>(
  ({ onCreate, associations, sequence }) => {
    onCreate((cBenefit) => {
      const { companyId, benefitId } = cBenefit

      return prisma.companyBenefit.create({
        data: {
          companyId,
          benefitId,
        },
      })
    })

    const benefitId = associations?.benefitId || BenefitFactory.build().id
    const companyId = associations?.companyId || CompanyFactory.build().id

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),

      companyId,
      benefitId,
    }
  }
)
