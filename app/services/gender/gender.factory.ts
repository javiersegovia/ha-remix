import type { Gender } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const GenderFactory = Factory.define<Gender>(({ onCreate }) => {
  onCreate((city) => {
    const { id: _, ...cityData } = city

    return prisma.gender.create({
      data: {
        ...cityData,
      },
    })
  })

  return {
    id: faker.datatype.number(),
    name: faker.datatype.string(20),
  }
})
