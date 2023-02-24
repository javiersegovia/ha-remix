import type { Permission, UserRole } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

type ExtendedUserRole = UserRole & {
  permissions?: Pick<Permission, 'code'>[]
}

export const UserRoleFactory = Factory.define<ExtendedUserRole>(
  ({ onCreate }) => {
    onCreate((userRole) => {
      const { permissions, ...userRoleData } = userRole

      return prisma.userRole.create({
        data: {
          ...userRoleData,
          permissions: {
            connect: permissions?.map((p) => ({ code: p.code })),
          },
        },
      })
    })

    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.datatype.uuid(), // We use "uuid" instead of a name, to make sure it is an unique value
      permissions: [],
    }
  }
)
