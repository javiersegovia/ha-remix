import * as companyService from './company.server'
import { prisma } from '~/db.server'
import { vi } from 'vitest'
import { CompanyFactory } from './company.factory'

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('getCompanies', () => {
  it('returns an array of companies', async () => {
    vi.spyOn(prisma.company, 'findMany').mockResolvedValueOnce([])
    const result = await companyService.getCompanies()
    expect(result).toEqual([])
  })
})

describe('requireCompany', () => {
  it('returns the company data', async () => {
    const company = CompanyFactory.build()
    vi.spyOn(prisma.company, 'findFirst').mockResolvedValueOnce(company)

    const result = await companyService.requireCompany({
      where: {
        id: 'my-company-ID',
      },
    })

    expect(result).toEqual<
      Awaited<ReturnType<typeof companyService.requireCompany>>
    >(company)
  })

  test('if the company is not found, throws NotFound Error', async () => {
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
