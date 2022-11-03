import type { Cryptocurrency, CryptoNetwork } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { CryptoNetworkFactory } from '../crypto-network/crypto-network.factory'

type ExtendedCryptocurrency = Cryptocurrency & {
  network?: CryptoNetwork
}

export const CryptocurrencyFactory = Factory.define<ExtendedCryptocurrency>(
  ({ params, onCreate }) => {
    onCreate((cryptocurrency) => {
      const { createdAt, updatedAt, name, acronym } = cryptocurrency

      return prisma.cryptocurrency.create({
        data: {
          createdAt,
          updatedAt,
          name,
          acronym,
        },
      })
    })

    const network = { ...CryptoNetworkFactory.build(), ...params?.network }

    return {
      id: faker.datatype.number(),
      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.datatype.string(10),
      acronym: faker.finance.currencyCode(),

      network,
      networkId: network.id,
    }
  }
)
