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

// TODO: Change format of "History"

describe('DATASTUDIO PayrollAdvances Query', () => {
  test('should return a list of payroll advances', async () => {
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

    const requestReason = await prisma.payrollAdvanceRequestReason.create({
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

            history: {
              create: {
                toStatus: PayrollAdvanceStatus.REQUESTED,
                actor: PayrollAdvanceHistoryActor.EMPLOYEE,
                employeeId: employee.id,
              },
            },

            requestReason: {
              connect: {
                id: requestReason.id,
              },
            },

            status: PayrollAdvanceStatus.REQUESTED,

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
    "companyId",
    "PayrollAdvance"."employeeId",
    jsonb_object_agg("PayrollAdvanceHistory"."toStatus", "PayrollAdvanceHistory"."createdAt") history,
    "PayrollAdvance"."createdAt",
    "requestedAmount",
    "totalAmount",
    "status",
    "PayrollAdvanceRequestReason"."name" as "requestReason",
    "requestReasonDescription"
    FROM "advance_api"."PayrollAdvance"
    LEFT JOIN "advance_api"."PayrollAdvanceTax" ON "PayrollAdvance"."id" = "PayrollAdvanceTax"."payrollAdvanceId"
    LEFT JOIN "advance_api"."PayrollAdvanceHistory" ON "PayrollAdvance"."id" = "PayrollAdvanceHistory"."payrollAdvanceId"
    LEFT JOIN "advance_api"."PayrollAdvanceRequestReason" ON "PayrollAdvance"."requestReasonId" = "PayrollAdvanceRequestReason"."id"
    GROUP BY "PayrollAdvance"."id",
    "PayrollAdvance"."companyId",
    "PayrollAdvance"."employeeId",
    "PayrollAdvance"."createdAt",
    "PayrollAdvance"."requestedAmount",
    "PayrollAdvance"."totalAmount",
    "PayrollAdvance"."status",
    "PayrollAdvanceRequestReason"."name";`

    expect(queryResult.length).toBe(5)
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
      > & {
        requestReason: string
        history: {
          REQUESTED: string
        }
      }
    >({
      id: expect.any(Number),
      companyId: expect.any(String),
      employeeId: expect.any(String),
      requestedAmount: expect.any(Number),
      totalAmount: expect.any(Number),
      createdAt: expect.any(Date),
      status: PayrollAdvanceStatus.REQUESTED,
      requestReason: requestReason.name,
      requestReasonDescription: 'Motivo personalizado',
      history: {
        REQUESTED: expect.any(String),
      },
    })
  })
})
