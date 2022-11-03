import type { Country, State } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { CountryFactory } from '../country/country.factory'
import { connect } from '~/utils/relationships'

type ExtendedState = State & {
  country?: Country
}

export const StateFactory = Factory.define<ExtendedState>(
  ({ onCreate, associations }) => {
    const country = associations?.country || CountryFactory.build()

    onCreate((state) => {
      const { name } = state

      return prisma.state.create({
        data: {
          name,
          country: connect(country.id),
        },
      })
    })

    return {
      id: faker.datatype.number(),
      name: faker.datatype.string(20),
      countryId: country.id,
    }
  }
)
