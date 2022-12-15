import type { Benefit, Membership } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connectMany } from '~/utils/relationships'

type ExtendedMembership = Membership & {
  benefits?: Pick<Benefit, 'id'>[]
}

export const MembershipFactory = Factory.define<ExtendedMembership>(
  ({ onCreate, associations }) => {
    onCreate(({ id: _, ...membershipData }) => {
      return prisma.membership.create({
        data: {
          ...membershipData,
          benefits: connectMany(associations?.benefits?.map((b) => b.id)),
        },
      })
    })

    return {
      id: faker.datatype.number(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.commerce.productName(),

      benefits: associations?.benefits || undefined,
    }
  }
)
