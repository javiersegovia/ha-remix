/** This function is intended to be used inside the Cypress tasks located inside "cypress.config.ts" */

import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { prisma } from '~/db.server'

export async function deleteEmployee(email: string) {
  if (!email) {
    throw new Error('Email required for deletion')
  }

  const employee = await prisma.employee.findFirst({
    where: {
      user: {
        email,
      },
    },
  })

  if (!employee) {
    return console.log('No employee found, so no need to delete')
  }

  try {
    // By deleting the user, the employee will be deleted too
    await prisma.user.delete({ where: { email } })
    await prisma.company.delete({ where: { id: employee.companyId } })
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      console.error('Company user or company not found')
    } else {
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}
