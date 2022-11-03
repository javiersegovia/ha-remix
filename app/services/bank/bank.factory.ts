import type { Bank } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const BankFactory = Factory.define<Bank>(({ onCreate }) => {
  onCreate((bank) => {
    const { id: _, ...bankData } = bank

    return prisma.bank.create({
      data: {
        ...bankData,
      },
    })
  })

  return {
    id: faker.datatype.number(),
    createdAt: new Date(),
    updatedAt: new Date(),

    // We use this UUID fn to make sure that every name is unique,
    name: faker.datatype.uuid(),
    countryId: null,
  }
})
