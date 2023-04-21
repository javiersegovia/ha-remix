import type { CompanyContactPerson } from '@prisma/client'
import { CompanyStatus } from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'

import * as companyService from '~/services/company/company.server'
import { CompanyCategoryFactory } from '~/services/company-category/company-category.factory'
import { CompanyFactory } from '~/services/company/company.factory'
import { CountryFactory } from '~/services/country/country.factory'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import { prisma } from '~/db.server'
import { MembershipFactory } from '~/services/membership/membership.factory'
import type { CompanySchemaInput } from '~/services/company/company.schema'

beforeEach(async () => {
  await truncateDB()
})

describe('createCompany', () => {
  it('creates a company with relationships', async () => {
    const contactPerson = {
      firstName: 'Luke',
      lastName: 'Skywalker',
      phone: '+1 234 2323512',
    }
    const country = await CountryFactory.create()
    const membership = await MembershipFactory.create()
    const companyCategories = await CompanyCategoryFactory.createList(2)
    const benefits = await BenefitFactory.createList(3)

    const companyData = CompanyFactory.build(undefined, {
      associations: {
        contactPerson,
        country,
        membership,
      },
    })

    const response = await companyService.createCompany({
      ...companyData,
      categoriesIds: companyCategories?.map((c) => c.id),
      benefitsIds: benefits?.map((b) => b.id),
    })

    const createdCompany = await prisma.company.findUnique({
      where: { id: response.company?.id },
      include: {
        contactPerson: true,
        country: true,
        categories: true,
        benefits: true,
      },
    })

    expect(response).toEqual<
      Awaited<ReturnType<typeof companyService.createCompany>>
    >({ company: { id: expect.any(String) } })

    expect(createdCompany?.categories).toHaveLength(2)
    expect(createdCompany?.benefits).toHaveLength(3)
    expect(createdCompany?.country).toEqual(country)

    expect(createdCompany?.contactPerson).toEqual<CompanyContactPerson>({
      ...contactPerson,
      id: expect.any(String),
      companyId: createdCompany?.id!,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })
})

describe('updateCompanyById', () => {
  it('updates a company with relationships', async () => {
    const contactPerson = {
      firstName: 'Luke',
      lastName: 'Skywalker',
      phone: '+1 234 2323512',
    }
    const country = await CountryFactory.createList(2)
    const companyCategories = await CompanyCategoryFactory.createList(2)
    const benefits = await BenefitFactory.createList(4)
    const previousBenefits = benefits.slice(0, 1)
    const newBenefits = benefits.slice(2, 3)

    const company = await CompanyFactory.create(
      {},
      {
        associations: {
          country: country[0],
          categories: companyCategories,
          benefits: previousBenefits,
        },
      }
    )

    const updateData: CompanySchemaInput = {
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
      benefitsIds: newBenefits.map((b) => b.id),
      countryId: country[1].id,
    }

    const response = await companyService.updateCompanyById(
      company.id,
      updateData
    )

    expect(response).toEqual<
      Awaited<ReturnType<typeof companyService.updateCompanyById>>
    >({ company: { id: company.id } })

    const updatedCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        contactPerson: true,
        country: true,
        categories: true,
        benefits: {
          include: {
            membership: true,
            companyBenefit: true,
          },
        },
      },
    })

    expect(updatedCompany?.categories).toHaveLength(0)

    expect(updatedCompany?.benefits).toEqual(
      newBenefits.sort((a, b) => a.name.localeCompare(b.name))
    )
    expect(updatedCompany?.country).toEqual(country[1])

    expect(updatedCompany?.contactPerson).toEqual<CompanyContactPerson>({
      ...contactPerson,
      id: expect.any(String),
      companyId: company.id,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })
})
