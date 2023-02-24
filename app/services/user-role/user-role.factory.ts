import type { UserRole } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const UserRoleFactory = Factory.define<UserRole>(({ onCreate }) => {
  onCreate((userRole) => {
    const { ...userRoleData } = userRole

    return prisma.userRole.create({
      data: {
        ...userRoleData,
      },
    })
  })

  return {
    id: faker.datatype.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: faker.datatype.uuid(), // We use "uuid" instead of a name, to make sure it is an unique value
  }
})
