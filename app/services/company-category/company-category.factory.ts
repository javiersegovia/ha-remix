import type { CompanyCategory } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const CompanyCategoryFactory = Factory.define<CompanyCategory>(
  ({ onCreate }) => {
    onCreate((companyCategory) => {
      const { ...companyCategoryData } = companyCategory

      return prisma.companyCategory.create({
        data: {
          ...companyCategoryData,
        },
      })
    })

    return {
      id: faker.datatype.number(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.datatype.uuid(), // We use "uuid" instead of a name, to make sure it is an unique value
    }
  }
)
