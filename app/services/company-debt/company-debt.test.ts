import { prisma } from '~/db.server'
import * as companyDebtService from './company-debt.server'

afterAll(() => {
  vi.restoreAllMocks()
})

describe('getCompanyDebtById', () => {
  test('return a CompanyDebt', async () => {
    const date = new Date()

    const expectedResult = {
      id: '1234',
      companyId: '123',
      createdAt: date,
      updatedAt: date,
      month: 1,
      year: 2022,
    }

    vi.spyOn(prisma.companyDebt, 'findUnique').mockResolvedValueOnce(
      expectedResult
    )

    const result = await companyDebtService.getCompanyDebtById('123')
    expect(result).toEqual(expectedResult)
  })
})

describe('getCompanyDebtsByCompanyId', () => {
  test('return an array of CompanyDebts', async () => {
    const date = new Date()

    const expectedResult = [
      {
        id: '1234',
        companyId: '123',
        createdAt: date,
        updatedAt: date,
        month: 1,
        year: 2022,
      },
      {
        id: '4567',
        companyId: '123',
        createdAt: date,
        updatedAt: date,
        month: 2,
        year: 2022,
      },
    ]

    vi.spyOn(prisma.companyDebt, 'findMany').mockResolvedValueOnce(
      expectedResult
    )

    const result = await companyDebtService.getCompanyDebtsByCompanyId('123')
    expect(result).toEqual(expectedResult)
  })
})

describe('upsertFiatMonthlyDebt', () => {
  test('if there is no existing CompanyDebt, create a new CompanyDebt', async () => {
    const date = new Date()
    const expectedResult = {
      companyId: '123',
      createdAt: date,
      updatedAt: date,
      id: '123',
      month: 1,
      year: 2022,
    }
    vi.spyOn(prisma.companyDebt, 'findFirst').mockResolvedValueOnce(null)
    vi.spyOn(prisma.companyDebt, 'create').mockResolvedValueOnce(expectedResult)

    const result = await companyDebtService.upsertFiatMonthlyDebt({
      payrollAdvance: {
        id: 123,
        companyId: '123',
        totalAmount: 22222,
      },
      companyId: '123',
      employee: {
        currencyId: 123,
      },
    })

    expect(result).toEqual<
      Awaited<ReturnType<typeof companyDebtService.upsertFiatMonthlyDebt>>
    >(expectedResult)
  })

  test('if there is an existing CompanyDebt, updates the existing CompanyDebt with a new value', async () => {
    const date = new Date()
    const expectedResult = {
      id: 'companyDebtId123',
      companyId: '123',
      createdAt: date,
      updatedAt: date,
      month: 1,
      year: 2022,
    }
    vi.spyOn(prisma.companyDebt, 'findFirst').mockResolvedValueOnce(
      expectedResult
    )
    vi.spyOn(prisma.companyDebt, 'update').mockResolvedValueOnce(expectedResult)

    const result = await companyDebtService.upsertFiatMonthlyDebt({
      payrollAdvance: {
        id: 123,
        companyId: '123',
        totalAmount: 22222,
      },
      companyId: '123',
      employee: {
        currencyId: 123,
      },
    })

    expect(result).toEqual(expectedResult)
  })
})
