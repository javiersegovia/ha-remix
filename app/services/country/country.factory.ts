import type { Country } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const CountryFactory = Factory.define<Country>(
  ({ sequence, onCreate }) => {
    onCreate((country) => {
      const { id: _, ...countryData } = country

      return prisma.country.create({
        data: {
          ...countryData,
        },
      })
    })

    return {
      id: sequence,
      name: faker.address.country(),
      code2: faker.datatype.string(20),
      phoneCode: faker.datatype.string(),
    }
  }
)
