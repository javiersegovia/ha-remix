import type { City, State } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { StateFactory } from '../state/state.factory'

type ExtendedCity = City & {
  state?: State
}

export const CityFactory = Factory.define<ExtendedCity>(
  ({ onCreate, associations }) => {
    const state = associations?.state || StateFactory.build()

    onCreate((city) => {
      const { name } = city

      return prisma.city.create({
        data: {
          name,
          stateId: state.id,
        },
      })
    })

    return {
      id: faker.datatype.number(),
      name: faker.datatype.string(20),
      stateId: state.id,
    }
  }
)
