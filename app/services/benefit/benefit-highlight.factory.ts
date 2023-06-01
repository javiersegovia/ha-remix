import type { Benefit, BenefitHighlight } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedBenefitHighlight = BenefitHighlight & {
  benefit?: Pick<Benefit, 'id'>
}

export const BenefitHighlightFactory = Factory.define<ExtendedBenefitHighlight>(
  ({ onCreate, associations, sequence }) => {
    onCreate((benefit) => {
      if (!associations.benefit) {
        throw new Error('Missing benefit association')
      }

      const { id: _, ...benefitHighlightData } = benefit

      return prisma.benefitHighlight.create({
        data: {
          ...benefitHighlightData,
          benefitId: undefined,
          benefit: connect(associations.benefit.id),
          imageId: undefined,
        },
        include: {
          benefit: true,
        },
      })
    })

    if (!associations.benefit) {
      throw new Error('Missing benefit association')
    }

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: faker.random.word(),
      description: faker.lorem.paragraph(),
      isActive: false,
      buttonHref: faker.internet.url(),
      buttonText: faker.random.word(),

      benefit: associations.benefit,
      benefitId: associations.benefit.id,
      imageId: null,
    }
  }
)
