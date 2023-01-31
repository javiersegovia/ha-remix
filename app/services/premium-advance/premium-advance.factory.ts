import type { Company, Employee, PremiumAdvance } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { PayrollAdvanceStatus } from '@prisma/client'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedPremiumAdvance = PremiumAdvance & {
  company?: Company
  employee?: Employee
}

export const PremiumAdvanceFactory = Factory.define<ExtendedPremiumAdvance>(
  ({ onCreate, associations }) => {
    onCreate((premiumAdvance) => {
      const {
        startDate,
        endDate,
        requestedAmount,
        createdAt,
        updatedAt,
        approvedAt,
        cancelledAt,
        deniedAt,
        paidAt,
        status,
        totalAmount,
        requestReasonDescription,
      } = premiumAdvance

      const { company, employee } = associations

      if (!company || !employee) {
        throw new Error('Missing associations')
      }

      return prisma.premiumAdvance.create({
        data: {
          createdAt,
          updatedAt,
          approvedAt,
          cancelledAt,
          deniedAt,
          paidAt,

          status,

          startDate,
          endDate,

          requestedAmount,
          totalAmount,

          requestReasonDescription,

          company: connect(company.id),
          employee: connect(employee.id),
        },
      })
    })

    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),

      approvedAt: null,
      cancelledAt: null,
      deniedAt: null,
      paidAt: null,

      startDate: new Date(),
      endDate: new Date(),

      status: PayrollAdvanceStatus.REQUESTED,

      requestedAmount: faker.datatype.number(),
      totalAmount: faker.datatype.number(),

      requestReasonDescription: faker.lorem.sentence(),

      requestReasonId: null,

      companyId: associations?.company?.id || faker.datatype.uuid(),
      employeeId: associations?.employee?.id || faker.datatype.uuid(),
    }
  }
)
