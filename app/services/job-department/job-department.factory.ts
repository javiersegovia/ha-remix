import type { JobDepartment } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const JobDepartmentFactory = Factory.define<JobDepartment>(
  ({ onCreate, sequence }) => {
    onCreate((jobDepartment) => {
      const { id: _, ...jobDepartmentData } = jobDepartment

      return prisma.jobDepartment.create({
        data: {
          ...jobDepartmentData,
        },
      })
    })

    return {
      id: sequence,

      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.datatype.string(20),
    }
  }
)
