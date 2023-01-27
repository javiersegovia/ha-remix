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
  Factory.define<ExtendedBenefitSubproduct>(
    ({ onCreate, sequence, associations }) => {
      const benefit = associations.benefit || BenefitFactory.build()

      onCreate((benefitSubproductData) => {
        const { name, discount } = benefitSubproductData

        if (!associations.benefit) {
          throw new Error('Missing benefit association')
        }

        return prisma.benefitSubproduct.create({
          data: {
            name,
            discount,
            benefit: connect(associations.benefit.id),
          },
          include: {
            benefit: true,
          },
        })
      })

      return {
        id: sequence,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: faker.commerce.productName(),
        discount: faker.datatype.number(),
        benefit,
        benefitId: benefit.id,
      }
    }
  )
