import type { BankAccountType } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const BankAccountTypeFactory = Factory.define<BankAccountType>(
  ({ onCreate }) => {
    onCreate((bankAccountType) => {
      const { name } = bankAccountType

      return prisma.bankAccountType.create({
        data: {
          name,
        },
      })
    })

    return {
      id: faker.datatype.number(),
      name: faker.datatype.string(20),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
)
