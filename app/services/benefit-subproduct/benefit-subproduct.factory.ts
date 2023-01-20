import type { BenefitSubproduct } from '@prisma/client'

import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { BenefitFactory } from '../benefit/benefit.factory'

type ExtendedBenefitSubproduct = BenefitSubproduct & {
  benefit: Pick<BenefitSubproduct, 'id'>
}

export const BenefitSubproductFactory =
  Factory.define<ExtendedBenefitSubproduct>(({ onCreate, associations }) => {
    onCreate(({ id: _, ...benefitSubproductData }) => {
      const { name } = benefitSubproductData

      if (!associations?.benefit) {
        throw new Error('Missing associations')
      }

      return prisma.benefitSubproduct.create({
        data: {
          name,
          benefit: connect(associations?.benefit?.id),
        },
        include: {
          benefit: true,
        },
      })
    })

    const benefit = associations?.benefit || BenefitFactory.build()

    return {
      id: faker.datatype.number(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.commerce.productName(),
      benefit,
      benefitId: benefit.id,
    }
  })
