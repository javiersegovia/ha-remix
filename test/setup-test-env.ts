import { faker } from '@faker-js/faker'
import { installGlobals } from '@remix-run/node'
import '@testing-library/jest-dom/extend-expect'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'

installGlobals()

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const MOCK_USER = {
  id: faker.datatype.uuid(),
  firstName: 'Jack',
  lastName: 'Sparrow',
  email: 'jack@sparrow.com',
}

// todo: create MOCK_EMPLOYEE object with common missing data: ID and COMPANY_ID

export const createMockEmployee = async () => {
  return await prisma.employee.create({
    data: {
      user: {
        create: {
          ...MOCK_USER,
        },
      },
      company: {
        create: {
          name: faker.company.name(),
        },
      },
    },
    include: {
      user: true,
    },
  })
}

// export const getMockUserSession = async ({
//   employee = mockedEmployee,
// } = {}) => {
//   const session = await testSessionStorage.getSession()
//   session.set(USER_SESSION_KEY, employee.user.id)
//   const cookie = await testSessionStorage.commitSession(session)
//   return parse(cookie)._session
// }
