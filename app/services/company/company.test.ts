import * as companyService from './company.server'
import { prisma } from '~/db.server'
import { vi } from 'vitest'
import { CompanyFactory } from './company.factory'
import { CountryFactory } from '../country/country.factory'
import { CompanyCategoryFactory } from './company-category.factory'
import { truncateDB } from 'test/helpers/truncateDB'

afterAll(async () => {
  vi.restoreAllMocks()
  await truncateDB()
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
  })
})

describe('createCompany', () => {
  test('should create a company with relationships', async () => {
    const contactPerson = {
      firstName: 'Luke',
      lastName: 'Skywalker',
      phone: '+1 234 2323512',
    }
    const country = await CountryFactory.create()
    const companyCategories = await CompanyCategoryFactory.createList(2)

    const companyData = CompanyFactory.build(
      {},
      {
        associations: {
          contactPerson,
          country,
          categories: companyCategories,
        },
      }
    )
    const response = await companyService.createCompany(companyData)

    expect(response).toMatchObject<
      Awaited<ReturnType<typeof companyService.createCompany>>
    >({ company: { id: companyData.id } })
  })
})
