import * as companyService from '~/services/company/company.server'
import { CompanyCategoryFactory } from '~/services/company-category/company-category.factory'
import { CompanyFactory } from '~/services/company/company.factory'
import { CountryFactory } from '~/services/country/country.factory'

import { truncateDB } from 'test/helpers/truncateDB'
import { CompanyStatus } from '@prisma/client'

beforeEach(async () => {
  await truncateDB()
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

describe('updateCompanyById', () => {
  test('should update a company', async () => {
    const contactPerson = {
      firstName: 'Luke',
      lastName: 'Skywalker',
      phone: '+1 234 2323512',
    }
    const country = await CountryFactory.create()
    const companyCategories = await CompanyCategoryFactory.createList(2)

    const company = await CompanyFactory.create(
      {},
      {
        associations: {
          country,
          categories: companyCategories,
        },
      }
    )

    const updateData = {
      name: 'New name',
      status: CompanyStatus.INACTIVE,
      address: 'New Address',
      description: 'New Description',
      dispersion: 2000,
      lastRequestDay: 20,
      paymentDays: [2, 5],
      phone: '+5234235',
      premiumDispersion: 20000,
      premiumLastRequestDay: 30,
      premiumPaymentDays: [2, 10],
      contactPerson,
    }

    const response = await companyService.updateCompanyById(
      company.id,
      updateData
    )

    expect(response).toMatchObject<
      Awaited<ReturnType<typeof companyService.updateCompanyById>>
    >({ company: { id: company.id } })
  })
})
