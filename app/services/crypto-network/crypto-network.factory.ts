import type { CryptoNetwork } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const CryptoNetworkFactory = Factory.define<CryptoNetwork>(
  ({ onCreate }) => {
    onCreate((cryptoNetwork) => {
      const { id: _, ...cryptoNetworkData } = cryptoNetwork

      return prisma.cryptoNetwork.create({
        data: {
          ...cryptoNetworkData,
        },
      })
    })

    return {
      id: faker.datatype.number(),
      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.finance.currencyName(),
      networkIdNumber: faker.datatype.number(100),
    }
  }
)
