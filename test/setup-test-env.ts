import { faker } from '@faker-js/faker'
import { installGlobals } from '@remix-run/node'
import '@testing-library/jest-dom/extend-expect'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import 'jest-extended'
import 'jest-extended/all'

installGlobals()

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const MOCK_USER = {
  id: faker.datatype.uuid(),
  firstName: 'Jack',
  lastName: 'Sparrow',
  email: 'jack@sparrow.com',
}

export const MOCK_COMPANY = {
  id: faker.datatype.uuid(),
  name: faker.company.name(),
}

// todo: create MOCK_EMPLOYEE object with common missing data: ID and COMPANY_ID
export const MOCK_EMPLOYEE = {
  id: faker.datatype.uuid(),
  user: MOCK_USER,
  userId: MOCK_USER.id,
  company: MOCK_COMPANY,
  companyId: MOCK_COMPANY.id,
}

export const createMockEmployee = async () => {
  return await prisma.employee.create({
    data: {
      id: MOCK_EMPLOYEE.id,
      user: {
        create: {
          ...MOCK_USER,
        },
      },
      company: {
        create: {
          ...MOCK_COMPANY,
        },
      },
    },
    include: {
      user: true,
      company: true,
    },
  })
}
