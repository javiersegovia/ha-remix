import { prisma } from '~/db.server'
import {
  PayrollAdvancePaymentMethod,
  PayrollAdvanceStatus,
} from '@prisma/client'
import { getMonthlyOverview } from './payroll-advance.server'
import { PayrollAdvanceFactory } from './payroll-advance.factory'

describe('getMonthlyOverview', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the correct overview and request days for a given month', async () => {
    const mockPayrollAdvances = [
      PayrollAdvanceFactory.build({
        createdAt: new Date(2022, 1, 1),
        status: PayrollAdvanceStatus.REQUESTED,
        paymentMethod: PayrollAdvancePaymentMethod.BANK_ACCOUNT,
        totalAmount: 100,
      }),
      PayrollAdvanceFactory.build({
        createdAt: new Date(2022, 1, 2),
        status: PayrollAdvanceStatus.APPROVED,
        paymentMethod: PayrollAdvancePaymentMethod.WALLET,
        totalAmount: 200,
      }),
      PayrollAdvanceFactory.build({
        createdAt: new Date(2022, 1, 3),
        status: PayrollAdvanceStatus.PAID,
        paymentMethod: PayrollAdvancePaymentMethod.BANK_ACCOUNT,
        totalAmount: 300,
      }),
    ]

    // Configure the mock function to return the mock data
    vi.spyOn(prisma.payrollAdvance, 'findMany').mockResolvedValue(
      mockPayrollAdvances
    )

    // Call the function with a test date
    const { overview, requestDays } = await getMonthlyOverview('2022-02')

    // Assert the overview has the correct values
    expect(overview[PayrollAdvanceStatus.REQUESTED]).toBe(1)
    expect(overview[PayrollAdvanceStatus.APPROVED]).toBe(1)
    expect(overview[PayrollAdvanceStatus.PAID]).toBe(1)

    expect(
      overview.totalRequested[PayrollAdvancePaymentMethod.BANK_ACCOUNT]
    ).toBe(400)

    expect(overview.totalRequested[PayrollAdvancePaymentMethod.WALLET]).toBe(
      200
    )

    expect(overview.totalPaid[PayrollAdvancePaymentMethod.BANK_ACCOUNT]).toBe(
      300
    )

    expect(overview.totalPaid[PayrollAdvancePaymentMethod.WALLET]).toBe(0)

    // Assert the requestDays has the correct values
    expect(requestDays).toHaveLength(3)
    expect(requestDays[0]).toEqual({
      quantity: 1,
      [PayrollAdvanceStatus.REQUESTED]: {
        [PayrollAdvancePaymentMethod.BANK_ACCOUNT]: 100,
      },
      dayNumber: new Date(2022, 1, 1).getTime(),
    })
    expect(requestDays[1]).toEqual({
      quantity: 1,
      [PayrollAdvanceStatus.APPROVED]: {
        [PayrollAdvancePaymentMethod.WALLET]: 200,
      },
      dayNumber: new Date(2022, 1, 2).getTime(),
    })
    expect(requestDays[2]).toEqual({
      quantity: 1,
      [PayrollAdvanceStatus.PAID]: {
        [PayrollAdvancePaymentMethod.BANK_ACCOUNT]: 300,
      },
      dayNumber: new Date(2022, 1, 3).getTime(),
    })
  })

  it('handles an empty response from the database', async () => {
    // Configure the mock function to return an empty array
    vi.spyOn(prisma.payrollAdvance, 'findMany').mockResolvedValue([])

    // Call the function with a test date
    const { overview, requestDays } = await getMonthlyOverview('2022-02')

    // Assert the overview and requestDays have the correct values
    expect(overview[PayrollAdvanceStatus.REQUESTED]).toBe(0)
    expect(overview[PayrollAdvanceStatus.APPROVED]).toBe(0)
    expect(overview[PayrollAdvanceStatus.PAID]).toBe(0)
    expect(
      overview.totalRequested[PayrollAdvancePaymentMethod.BANK_ACCOUNT]
    ).toBe(0)
    expect(overview.totalRequested[PayrollAdvancePaymentMethod.WALLET]).toBe(0)
    expect(overview.totalPaid[PayrollAdvancePaymentMethod.BANK_ACCOUNT]).toBe(0)
    expect(overview.totalPaid[PayrollAdvancePaymentMethod.WALLET]).toBe(0)
    expect(requestDays).toHaveLength(0)
  })

  it('handles invalid date input', async () => {
    // Configure the mock function to return an empty array
    vi.spyOn(prisma.payrollAdvance, 'findMany').mockResolvedValue([])

    // Call the function with an invalid date
    const { overview, requestDays } = await getMonthlyOverview('Invalid Date')

    // Assert the overview and requestDays have the correct values
    expect(overview[PayrollAdvanceStatus.REQUESTED]).toBe(0)
    expect(overview[PayrollAdvanceStatus.APPROVED]).toBe(0)
    expect(overview[PayrollAdvanceStatus.PAID]).toBe(0)
    expect(
      overview.totalRequested[PayrollAdvancePaymentMethod.BANK_ACCOUNT]
    ).toBe(0)
    expect(overview.totalRequested[PayrollAdvancePaymentMethod.WALLET]).toBe(0)
    expect(overview.totalPaid[PayrollAdvancePaymentMethod.WALLET]).toBe(0)
    expect(requestDays).toHaveLength(0)
  })
})
