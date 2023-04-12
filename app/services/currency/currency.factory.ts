import type { Currency } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const CurrencyFactory = Factory.define<Currency>(
  ({ onCreate, sequence }) => {
    onCreate((currency) => {
      return prisma.currency.create({
        data: {
          ...currency,
        },
      })
    })

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.datatype.string(10),
      code: faker.datatype.string(10),

      countryId: null,
    }
  }
)
