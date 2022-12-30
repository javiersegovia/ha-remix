import { faker } from '@faker-js/faker'
import type { Company } from '@prisma/client'

import { CompanyStatus } from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'

beforeEach(async () => {
  await truncateDB()
})

describe('DATASTUDIO Companies Query', () => {
  test('should return a list of companies', async () => {
    const country = await prisma.country.create({
      data: {
        name: 'Venezuela',
        code2: 'VE',
        phoneCode: '+58',
      },
    })

    const category = await prisma.companyCategory.upsert({
      where: {
        name: 'Tecnología',
      },
      create: {
        name: 'Tecnología',
      },
      update: {},
    })

    const createCompanyData = {
      name: faker.company.name(),
      country: {
        connect: {
          id: country.id,
        },
      },
      phone: '+58 1230000000',
      status: CompanyStatus.ACTIVE,
      address: 'Custom Address',
      description: 'Developer-friendly tech company',
      paymentDays: [10, 20],
      lastRequestDay: 25,
      premiumPaymentDays: [15, 25],
      premiumLastRequestDay: 30,
      categories: {
        connect: {
          id: category.id,
        },
        connectOrCreate: {
          create: {
            name: 'Ventas',
          },
          where: {
            name: 'Ventas',
          },
        },
      },
    }

    const createCompaniesPromises: Promise<Company>[] = []

    for (let i = 0; i < 5; i++) {
      createCompaniesPromises.push(
        prisma.company.create({
          data: createCompanyData,
        })
      )
    }

    await Promise.all(createCompaniesPromises)

    const queryResult = await prisma.$queryRaw<Company[]>`SELECT DISTINCT 
    "Company"."id",
    "Company"."name", 
    "Company"."createdAt",
    string_agg("CompanyCategory"."name", ', ' order by "CompanyCategory"."name") as "categories",
    "address",
    "description",
    "phone",
    "status",
    array_to_string("paymentDays", ', ') as "paymentDays",
    "lastRequestDay",
    array_to_string("premiumPaymentDays", ', ') as "premiumPaymentDays",
    "premiumLastRequestDay",
    "Country"."name" as "country" 
    FROM "advance_api"."Company" 
    LEFT JOIN "advance_api"."Country" ON "Country"."id" = "Company"."countryId" 
    LEFT OUTER JOIN "advance_api"."_CompanyToCompanyCategory" ON "Company"."id" = "_CompanyToCompanyCategory"."A" 
    LEFT JOIN "advance_api"."CompanyCategory" ON "CompanyCategory"."id" = "_CompanyToCompanyCategory"."B" 
    GROUP BY "Company"."id", "Country"."name";`

    const {
      name,
      address,
      description,
      phone,
      status,
      paymentDays,
      lastRequestDay,
      premiumPaymentDays,
      premiumLastRequestDay,
    } = createCompanyData

    expect(queryResult.length).toEqual(5)
    expect(queryResult[0]).toEqual<
      Pick<
        Company,
        | 'id'
        | 'createdAt'
        | 'name'
        | 'address'
        | 'description'
        | 'phone'
        | 'status'
        | 'lastRequestDay'
        | 'premiumLastRequestDay'
      > & {
        paymentDays: string
        premiumPaymentDays: string
        country: string
        categories: string
      }
    >({
      id: expect.any(String),
      createdAt: expect.any(Date),
      name,
      address,
      description,
      phone,
      status,
      paymentDays: paymentDays.join(', '),
      premiumPaymentDays: premiumPaymentDays.join(', '),
      lastRequestDay,
      premiumLastRequestDay,
      country: country.name,
      categories: 'Tecnología, Ventas',
    })
  })
})
