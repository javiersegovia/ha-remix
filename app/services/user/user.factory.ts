import type { User, UserRole } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedUser = User & {
  role?: UserRole
}

export const UserFactory = Factory.define<ExtendedUser>(
  ({ onCreate, associations }) => {
    onCreate((user) => {
      const {
        createdAt,
        updatedAt,
        email,
        firstName,
        lastName,
        password,
        loginExpiration,
        loginToken,
        verifiedEmail,
        role,
      } = user

      return prisma.user.create({
        data: {
          createdAt,
          updatedAt,
          email,
          firstName,
          lastName,
          password,
          verifiedEmail,
          loginExpiration,
          loginToken,
          role: connect(role?.id),
        },
      })
    })

    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      verifiedEmail: false,

      password: null,
      loginExpiration: null,
      loginToken: null,

      roleId: associations?.role?.id || null,
    }
  }
)
