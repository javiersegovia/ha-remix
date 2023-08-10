import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const MeasurerFactory = Factory.define<Measurer>(({ onCreate }) => {
  onCreate((measurer) => {
    const { id, createdAt, updatedAt, name, value } = measurer
    return prisma.measurer.create({
      data: {
        id,
        createdAt,
        updatedAt,
        name,
        value,
      },
    })
  })
  return {
    id: faker.datatype.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: faker.datatype.string(),
    value: faker.datatype.float(),
  }
})
