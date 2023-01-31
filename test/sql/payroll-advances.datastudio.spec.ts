import type { PayrollAdvance } from '@prisma/client'

import {
  PayrollAdvanceStatus,
  PayrollAdvanceHistoryActor,
  PayrollAdvancePaymentMethod,
} from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'
import { faker } from '@faker-js/faker'

beforeEach(async () => {
  await truncateDB()
})

describe('DATASTUDIO PayrollAdvances Query', () => {
  it('returns a list of payroll advances', async () => {
    const employee = await prisma.employee.create({
      data: {
        user: {
          create: {
            email: faker.internet.email(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
          },
        },
        company: {
          create: {
            name: faker.company.name(),
          },
        },
      },
      select: {
        id: true,
        company: {
          select: {
            id: true,
          },
        },
      },
    })

    const requestReason = await prisma.requestReason.create({
      data: {
        name: 'Emergencia',
      },
      select: {
        id: true,
        name: true,
      },
    })

    const createPayrollAdvancesPromises: Promise<PayrollAdvance>[] = []

    for (let i = 0; i < 5; i++) {
      const requestedAmount = faker.datatype.number({ min: 100, max: 1000000 })
      createPayrollAdvancesPromises.push(
        prisma.payrollAdvance.create({
          data: {
            requestedAmount,
            totalAmount: requestedAmount,
            paymentMethod: PayrollAdvancePaymentMethod.BANK_ACCOUNT,

            approvedAt: new Date(),
            paidAt: new Date(),
            cancelledAt: new Date(),
            deniedAt: new Date(),

            history: {
              createMany: {
                data: [
                  {
                    toStatus: PayrollAdvanceStatus.REQUESTED,
                    actor: PayrollAdvanceHistoryActor.EMPLOYEE,
                    employeeId: employee.id,
                  },
                  {
                    toStatus: PayrollAdvanceStatus.APPROVED,
                    actor: PayrollAdvanceHistoryActor.ADMIN,
                  },
                  {
                    toStatus: PayrollAdvanceStatus.PAID,
                    actor: PayrollAdvanceHistoryActor.ADMIN,
                  },
                ],
              },
            },

            requestReason: {
              connect: {
                id: requestReason.id,
              },
            },

            status: PayrollAdvanceStatus.PAID,

            requestReasonDescription: 'Motivo personalizado',

            employee: {
              connect: {
                id: employee.id,
              },
            },

            company: {
              connect: {
                id: employee.company.id,
              },
            },
          },
        })
      )
    }

    await Promise.all(createPayrollAdvancesPromises)

    const queryResult = await prisma.$queryRaw<PayrollAdvance[]>`SELECT DISTINCT
      "PayrollAdvance"."id",
      "PayrollAdvance"."companyId",
      "Company"."name" as "companyName",
      "PayrollAdvance"."employeeId",
      "User"."email" as "employeeEmail",
      jsonb_object_agg("PayrollAdvanceHistory"."toStatus", "PayrollAdvanceHistory"."createdAt") history,
      "PayrollAdvance"."createdAt",
      "approvedAt",
      "deniedAt",
      "paidAt",
      "cancelledAt",
      "requestedAmount",
      "totalAmount",
      "PayrollAdvance"."status",
      "RequestReason"."name" as "requestReason",
      "requestReasonDescription"
      FROM "advance_api"."PayrollAdvance"
      LEFT JOIN "advance_api"."PayrollAdvanceTax" ON "PayrollAdvance"."id" = "PayrollAdvanceTax"."payrollAdvanceId"
      LEFT JOIN "advance_api"."Company" ON "PayrollAdvance"."companyId" = "Company"."id"
      LEFT JOIN "advance_api"."Employee" ON "PayrollAdvance"."employeeId" = "Employee"."id"
      LEFT JOIN "advance_api"."User" ON "Employee"."userId" = "User"."id"
      LEFT JOIN "advance_api"."PayrollAdvanceHistory" ON "PayrollAdvance"."id" = "PayrollAdvanceHistory"."payrollAdvanceId"
      LEFT JOIN "advance_api"."RequestReason" ON "PayrollAdvance"."requestReasonId" = "RequestReason"."id"
      GROUP BY 
        "PayrollAdvance"."id",
        "User"."email",
        "Company"."name",
        "PayrollAdvance"."companyId",
        "PayrollAdvance"."employeeId",
        "PayrollAdvance"."createdAt",
        "PayrollAdvance"."requestedAmount",
        "PayrollAdvance"."totalAmount",
        "PayrollAdvance"."status",
        "RequestReason"."name";`

    expect(queryResult.length).toEqual(5)
    expect(queryResult[0]).toEqual<
      Pick<
        PayrollAdvance,
        | 'id'
        | 'companyId'
        | 'employeeId'
        | 'createdAt'
        | 'requestedAmount'
        | 'totalAmount'
        | 'status'
        | 'requestReasonDescription'
        | 'approvedAt'
        | 'paidAt'
        | 'deniedAt'
        | 'cancelledAt'
      > & {
        companyName: string
        employeeEmail: string
        requestReason: string
        history: {
          REQUESTED: string
          APPROVED: string
          PAID: string
        }
      }
    >({
      id: expect.any(Number),
      companyId: expect.any(String),
      companyName: expect.any(String),
      employeeEmail: expect.any(String),
      employeeId: expect.any(String),
      requestedAmount: expect.any(Number),
      totalAmount: expect.any(Number),
      createdAt: expect.any(Date),
      approvedAt: expect.any(Date),
      paidAt: expect.any(Date),
      deniedAt: expect.any(Date),
      cancelledAt: expect.any(Date),
      status: PayrollAdvanceStatus.PAID,
      requestReason: requestReason.name,
      requestReasonDescription: 'Motivo personalizado',
      history: {
        REQUESTED: expect.any(String),
        APPROVED: expect.any(String),
        PAID: expect.any(String),
      },
    })
  })
})
