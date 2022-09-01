/** This function is intended to be used inside the Cypress tasks located inside "cypress.config.ts" */

import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'
import { prisma } from '~/db.server'

export const createEmployee = async (email: string, password: string) => {
  if (!email.endsWith('@example.com')) {
    throw new Error('All test emails must end in @example.com')
  }

  return prisma.employee.create({
    data: {
      user: {
        create: {
          email,
          password: await hash(password, 10),
        },
      },
      company: {
        create: {
          name: faker.company.name(),
        },
      },
    },
  })
}
