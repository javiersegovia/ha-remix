import type { BenefitConsumption } from '@prisma/client'

import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'
import { BenefitSubproductFactory } from '~/services/benefit-subproduct/benefit-subproduct.factory'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import { CompanyFactory } from '~/services/company/company.factory'
import { EmployeeFactory } from '~/services/employee/employee.factory'
import { BenefitConsumptionFactory } from '../../app/services/benefit-consumption/benefit-consumption.factory'

beforeEach(async () => {
  await truncateDB()
})

describe('DATASTUDIO - BenefitConsumptions', () => {
  test('should return a list of benefit consumptions', async () => {
    const [company1, company2] = await CompanyFactory.createList(2)
    const employee1 = await EmployeeFactory.create(undefined, {
      associations: {
        company: company1,
      },
    })
    const employee2 = await EmployeeFactory.create(undefined, {
      associations: {
        company: company2,
      },
    })

    const benefit = await BenefitFactory.create()
    const benefitSubproducts = await BenefitSubproductFactory.createList(
      5,
      undefined,
      {
        associations: {
          benefit,
        },
      }
    )

    await Promise.all([
      BenefitConsumptionFactory.createList(2, undefined, {
        associations: {
          benefit,
          employee: employee1,
          benefitSubproduct: benefitSubproducts[0],
        },
      }),
      BenefitConsumptionFactory.createList(2, undefined, {
        associations: {
          benefit,
          employee: employee2,
          benefitSubproduct: benefitSubproducts[1],
        },
      }),
    ])

    const queryResult = await prisma.$queryRaw<
      BenefitConsumption[]
    >`SELECT DISTINCT
    "BenefitConsumption"."id" as "benefitConsumptionId", 
    "BenefitConsumption"."consumedAt", 
    "BenefitConsumption"."value", 
    "BenefitSubproduct"."name" AS "benefitSubproductName", 
    "BenefitSubproduct"."id" AS "benefitSubproductId", 
    "Benefit"."name" AS "benefitName", 
    "Benefit"."id" AS "benefitId", 
    "User"."email", 
    "Employee"."id" AS "employeeId"
    FROM "advance_api"."BenefitConsumption"
    LEFT JOIN "advance_api"."BenefitSubproduct" ON "BenefitConsumption"."benefitSubproductId" = "BenefitSubproduct"."id"
    LEFT JOIN "advance_api"."Benefit" ON "BenefitConsumption"."benefitId" = "Benefit"."id"
    LEFT JOIN "advance_api"."Employee" ON "BenefitConsumption"."employeeId" = "Employee"."id"
    LEFT JOIN "advance_api"."User" ON "advance_api"."User"."id" = "Employee"."userId";`

    expect(queryResult.length).toEqual(4)
    expect(queryResult[0]).toEqual({
      benefitConsumptionId: expect.any(Number),
      consumedAt: expect.any(Date),
      value: expect.any(Number),
      benefitSubproductName: expect.any(String),
      benefitSubproductId: expect.any(Number),
      benefitName: expect.any(String),
      benefitId: expect.any(Number),
      email: expect.any(String),
      employeeId: expect.any(String),
    })
  })
})
