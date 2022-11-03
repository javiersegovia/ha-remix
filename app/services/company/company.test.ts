import * as companyService from './company.server'
import { prisma } from '~/db.server'
import { vi } from 'vitest'
import { CompanyFactory } from './company.factory'

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('getCompanies', () => {
  test('should return an array of companies', async () => {
    vi.spyOn(prisma.company, 'findMany').mockResolvedValueOnce([])
    const result = await companyService.getCompanies()
    expect(result).toEqual([])
  })
})

describe('requireCompany', () => {
  test('shold return the company data', async () => {
    const company = CompanyFactory.build()
    vi.spyOn(prisma.company, 'findFirst').mockResolvedValueOnce(company)

    const result = await companyService.requireCompany({
      where: {
        id: 'my-company-ID',
      },
    })

    expect(result).toMatchObject<
      Awaited<ReturnType<typeof companyService.requireCompany>>
    >(company)
  })

  test('shold throw if the company is not found', async () => {
    vi.spyOn(prisma.company, 'findFirst').mockResolvedValueOnce(null)

    let result

    try {
      result = await companyService.requireCompany({
        where: {
          id: 'my-company-ID',
        },
      })
    } catch (e) {
      result = e
    }

    expect((result as Response).status).toEqual(404)
    expect((result as Response).statusText).toEqual(
      'La compañía no ha sido encontrada'
    )
  })
})
