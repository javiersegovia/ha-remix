import type { JobPosition } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const JobPositionFactory = Factory.define<JobPosition>(
  ({ onCreate }) => {
    onCreate((jobPosition) => {
      const { id: _, ...jobPositionData } = jobPosition

      return prisma.jobPosition.create({
        data: {
          ...jobPositionData,
        },
      })
    })

    return {
      id: faker.datatype.number(),

      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.datatype.string(20),
    }
  }
)
