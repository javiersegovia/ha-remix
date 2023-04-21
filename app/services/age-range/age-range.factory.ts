import type { AgeRange } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const AgeRangeFactory = Factory.define<AgeRange>(
  ({ onCreate, sequence }) => {
    onCreate((ageRange) => {
      const { ...ageRangeData } = ageRange

      return prisma.ageRange.create({
        data: {
          ...ageRangeData,
        },
      })
    })

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),

      minAge: faker.datatype.number(),
      maxAge: faker.datatype.number(),
    }
  }
)
