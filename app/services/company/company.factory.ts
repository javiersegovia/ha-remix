import type {
  Bank,
  Benefit,
  Company,
  CompanyCategory,
  CompanyContactPerson,
  Country,
  Cryptocurrency,
  Membership,
} from '@prisma/client'

import { Factory } from 'fishery'
import { CompanyStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { prisma } from '~/db.server'
import { connect, connectMany } from '~/utils/relationships'

type ExtendedCompany = Company & {
  country?: Country
  membership?: Membership
  banks?: Bank[]
  categories?: Pick<CompanyCategory, 'id' | 'name'>[]
  benefits?: Pick<Benefit, 'id' | 'name'>[]
  contactPerson?: Pick<CompanyContactPerson, 'firstName' | 'lastName' | 'phone'>
  cryptocurrencies?: Cryptocurrency[]
}

type ExtendedCompanyResult = Omit<ExtendedCompany, 'contactPerson'> & {
  contactPerson?: CompanyContactPerson
  categories?: CompanyCategory[]
}

export const CompanyFactory = Factory.define<
  ExtendedCompany,
  null,
  ExtendedCompanyResult
>(({ onCreate, associations }) => {
  onCreate((company) => {
    const {
      countryId: _,
      membershipId: _2,
      contactPerson,
      ...companyData
    } = company

    return prisma.company.create({
      data: {
        ...companyData,

        contactPerson: contactPerson
          ? {
              create: {
                ...contactPerson,
              },
            }
          : undefined,

        country: connect(associations?.country?.id),

        banks: connectMany(associations?.banks?.map((bank) => bank.id)),

        categories: connectMany(
          associations?.categories?.map((category) => category.id)
        ),

        benefits: connectMany(
          associations?.benefits?.map((benefit) => benefit.id)
        ),

        cryptocurrencies: connectMany(
          associations?.cryptocurrencies?.map(
            (cryptocurrency) => cryptocurrency.id
          )
        ),
      },
    })
  })

  return {
    id: faker.datatype.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: faker.company.name(),
    status: CompanyStatus.ACTIVE,
    description: null,
    address: null,
    phone: null,

    countryId: associations?.country?.id || null,
    membershipId: associations?.membership?.id || null,

    categories: associations?.categories || undefined,
    benefits: associations?.benefits || undefined,

    lastRequestDay: 32,
    paymentDays: [],
    dispersion: null,

    premiumLastRequestDay: 32,
    premiumPaymentDays: [],
    premiumDispersion: null,
  }
})
