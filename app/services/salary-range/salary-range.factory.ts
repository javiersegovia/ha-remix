import type { SalaryRange } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const SalaryRangeFactory = Factory.define<SalaryRange>(
  ({ onCreate, sequence }) => {
    onCreate((salaryRange) => {
      const { id: _, ...salaryRangeData } = salaryRange

      return prisma.salaryRange.create({
        data: {
          ...salaryRangeData,
        },
      })
    })

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.datatype.uuid(),
    }
  }
)
