import type { BenefitCategory } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const BenefitCategoryFactory = Factory.define<BenefitCategory>(
  ({ sequence, onCreate }) => {
    onCreate((benefitCategory) => {
      const { id: _, ...benefitCategoryData } = benefitCategory

      return prisma.benefitCategory.create({
        data: {
          ...benefitCategoryData,
        },
      })
    })

    return {
      id: sequence,
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      name: faker.commerce.department(),
    }
  }
)
