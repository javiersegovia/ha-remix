import type { Gender } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const GenderFactory = Factory.define<Gender>(
  ({ onCreate, sequence }) => {
    onCreate((gender) => {
      const { ...genderData } = gender

      return prisma.gender.create({
        data: {
          ...genderData,
        },
      })
    })

    return {
      id: sequence,
      name: faker.datatype.string(20),
    }
  }
)
