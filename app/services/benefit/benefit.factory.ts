import type { Benefit } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const BenefitFactory = Factory.define<Benefit>(({ onCreate }) => {
  onCreate(({ id: _, ...benefitData }) => {
    return prisma.benefit.create({
      data: {
        ...benefitData,
      },
    })
  })

  return {
    id: faker.datatype.number(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: faker.commerce.productName(),
  }
})
