import type { IdentityDocumentType } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const IdentityDocumentTypeFactory = Factory.define<IdentityDocumentType>(
  ({ onCreate }) => {
    onCreate((identityDocumentType) => {
      const { name } = identityDocumentType

      return prisma.identityDocumentType.create({
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
