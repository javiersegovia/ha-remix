import type { Membership } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const MembershipFactory = Factory.define<Membership>(({ onCreate }) => {
  onCreate(({ id: _, ...membershipData }) => {
    return prisma.membership.create({
      data: {
        ...membershipData,
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
