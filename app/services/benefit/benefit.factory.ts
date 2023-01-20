import type { Benefit, Membership } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedBenefit = Benefit & {
  membership?: Pick<Membership, 'id'>
}

export const BenefitFactory = Factory.define<ExtendedBenefit>(
  ({ onCreate, associations }) => {
    onCreate(({ id: _, ...benefitData }) => {
      return prisma.benefit.create({
        data: {
          ...benefitData,

          membership: connect(associations?.membership?.id),
        },
      })
    })

    return {
      id: faker.datatype.number(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.commerce.productName(),
      imageUrl: faker.image.imageUrl(),
      buttonHref: faker.internet.url(),
      buttonText: faker.datatype.string(),
      slug: faker.datatype.string(),

      membership: associations?.membership,
    }
  }
)
// Update the BenefitFactory function above to include "subproducts"
