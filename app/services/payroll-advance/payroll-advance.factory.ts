// AI
// Create a payroll advance factory using the "fishery" library
// Using the "Factory.define" function and including associations with the "onCreate" hook
// Using "app/services/company/company.factory.ts" as a reference
import type { Company, Employee, PayrollAdvance } from '@prisma/client'

import {
  PayrollAdvanceStatus,
  PayrollAdvancePaymentMethod,
} from '@prisma/client'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedPayrollAdvance = PayrollAdvance & {
  company?: Company
  employee?: Employee
}

export const PayrollAdvanceFactory = Factory.define<ExtendedPayrollAdvance>(
  ({ onCreate, associations, sequence }) => {
    onCreate((payrollAdvance) => {
      const {
        requestedAmount,
        createdAt,
        updatedAt,
        status,
        paymentMethod,
        totalAmount,
      } = payrollAdvance

      const { company, employee } = associations

      if (!company || !employee) {
        throw new Error('Missing associations')
      }

      return prisma.payrollAdvance.create({
        data: {
          createdAt,
          updatedAt,
          status,
          paymentMethod,
          requestedAmount,
          totalAmount,
          company: connect(company.id),
          employee: connect(employee.id),
        },
      })
    })

    return {
      id: sequence,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      cancelledAt: null,
      deniedAt: null,
      paidAt: null,
      paymentTermDays: faker.datatype.number(),
      requestedAmount: faker.datatype.number(),
      requestReasonDescription: faker.lorem.sentence(),
      periodOfDays: faker.datatype.number(),
      paymentDate: new Date().getTime(),
      status: PayrollAdvanceStatus.REQUESTED,
      paymentMethod: PayrollAdvancePaymentMethod.BANK_ACCOUNT,
      totalAmount: faker.datatype.number(),

      companyCryptoDebtId: faker.datatype.uuid(),
      companyFiatDebtId: faker.datatype.uuid(),
      requestReasonId: sequence,

      companyId: associations?.company?.id || faker.datatype.uuid(),
      employeeId: associations?.employee?.id || faker.datatype.uuid(),
    }
  }
)
