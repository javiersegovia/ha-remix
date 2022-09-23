import type { Prisma } from '@prisma/client'
import { CompanyStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { prisma } from '~/db.server'

export const CompanyFactory = {
  build: (attrs: Partial<Prisma.CompanyCreateInput> = {}) => {
    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.company.name(),
      status: CompanyStatus.ACTIVE,
      description: null,
      address: null,
      phone: null,
      countryId: null,

      lastRequestDay: 32,
      paymentDays: [],
      dispersion: null,

      premiumLastRequestDay: 32,
      premiumPaymentDays: [],
      premiumDispersion: null,
      ...attrs,
    } as Prisma.CompanyCreateInput
  },
  create: async function (attrs: Partial<Prisma.CompanyCreateInput> = {}) {
    return await prisma.company.create({ data: CompanyFactory.build(attrs) })
  },
}
