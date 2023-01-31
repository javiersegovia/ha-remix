import type { Employee, PayrollAdvance } from '@prisma/client'

import {
  PayrollAdvanceStatus,
  PayrollAdvanceHistoryActor,
  PayrollAdvancePaymentMethod,
} from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'
import { faker } from '@faker-js/faker'
import { JobDepartmentFactory } from '~/services/job-department/job-department.factory'
import { JobPositionFactory } from '~/services/job-position/job-position.factory'
import { BankFactory } from '~/services/bank/bank.factory'
import { CompanyFactory } from '~/services/company/company.factory'
import { GenderFactory } from '~/services/gender/gender.factory'
import { EmployeeStatus } from '@prisma/client'
import { connect } from '~/utils/relationships'

beforeEach(async () => {
  await truncateDB()
})

describe('DATASTUDIO Employee_PayrollAdvances Query', () => {
  it('returns a list of employees and their payroll advances', async () => {
    const createCountry = prisma.country.create({
      data: {
        name: 'Venezuela',
        code2: 'VE',
        phoneCode: '+58',
        states: {
          create: {
            name: 'Distrito Capital',
            cities: {
              create: {
                name: 'Caracas',
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        states: {
          select: {
            id: true,
            name: true,
            cities: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    const [country, gender, jobDepartment, jobPosition, bank, company] =
      await Promise.all([
        createCountry,
        GenderFactory.create(),
        JobDepartmentFactory.create(),
        JobPositionFactory.create(),
        BankFactory.create(),
        CompanyFactory.create(),
      ])

    const createEmployeesPromises: Promise<Employee>[] = []

    for (let i = 0; i < 3; i++) {
      createEmployeesPromises.push(
        prisma.employee.create({
          data: {
            company: connect(company.id),
            country: connect(country.id),
            state: connect(country.states[0].id),
            city: connect(country.states[0].cities[0].id),
            gender: connect(gender.id),
            jobDepartment: connect(jobDepartment.id),
            jobPosition: connect(jobPosition.id),
            user: {
              create: {
                email: `${i}__sample@test.com`,
                firstName: 'Jack',
                lastName: 'Sparrow',
              },
            },

            inactivatedAt: new Date(),

            bankAccount: {
              create: {
                bank: connect(bank.id),
                identityDocument: {
                  create: {
                    value: '0120200202',
                    documentType: {
                      connectOrCreate: {
                        create: {
                          name: 'Pasaporte',
                        },
                        where: {
                          name: 'Pasaporte',
                        },
                      },
                    },
                  },
                },
                accountNumber: '2873892378278',
                accountType: {
                  connectOrCreate: {
                    where: {
                      name: 'Corriente',
                    },
                    create: {
                      name: 'Corriente',
                    },
                  },
                },
              },
            },
            birthDay: new Date(),
            salaryFiat: 748932498372,
            phone: '+58 1230000000',
            status: EmployeeStatus.ACTIVE,
            address: 'Random street address',
            numberOfChildren: 5,
            advanceAvailableAmount: 2000,
            advanceMaxAmount: 2000,
          },
        })
      )
    }

    const employees = await Promise.all(createEmployeesPromises)

    const createPayrollAdvancesPromises: Promise<PayrollAdvance>[] = []

    for (let i = 0; i < 4; i++) {
      const requestedAmount = faker.datatype.number({ min: 100, max: 1000000 })
      createPayrollAdvancesPromises.push(
        prisma.payrollAdvance.create({
          data: {
            requestedAmount,
            totalAmount: requestedAmount,
            paymentMethod: PayrollAdvancePaymentMethod.BANK_ACCOUNT,

            approvedAt: new Date(),
            paidAt: new Date(),
            cancelledAt: new Date(),
            deniedAt: new Date(),

            history: {
              createMany: {
                data: [
                  {
                    toStatus: PayrollAdvanceStatus.REQUESTED,
                    actor: PayrollAdvanceHistoryActor.EMPLOYEE,
                    employeeId: employees[i % employees.length].id,
                  },
                  {
                    toStatus: PayrollAdvanceStatus.APPROVED,
                    actor: PayrollAdvanceHistoryActor.ADMIN,
                  },
                  {
                    toStatus: PayrollAdvanceStatus.PAID,
                    actor: PayrollAdvanceHistoryActor.ADMIN,
                  },
                ],
              },
            },

            requestReason: {
              create: {
                name: faker.word.noun(),
              },
            },

            status: PayrollAdvanceStatus.PAID,

            requestReasonDescription: 'Motivo personalizado',

            employee: connect(employees[i % employees.length].id),
            company: connect(company.id),
          },
        })
      )
    }

    await Promise.all(createPayrollAdvancesPromises)

    type R = Employee & { payrollAdvances: PayrollAdvance[] }[]

    const queryResult = await prisma.$queryRaw<R>`SELECT DISTINCT
    "Employee"."id",
    "Employee"."createdAt",
    "inactivatedAt",
    "Employee"."companyId",
    "Company"."name" as "companyName",
    "firstName",
    "lastName",
    "email",
    "Employee"."status",
    "Employee"."address",
    "numberOfChildren",
    "birthDay",
    "salaryFiat",
    "value" as "identityDocumentValue",
    "IdentityDocumentType"."name" as "identityDocumentType",
    "advanceAvailableAmount",
    "advanceMaxAmount",
    "Bank"."name" as "bank",
    "BankAccountType"."name" as "bankAccountType",
    "JobDepartment"."name" as "jobDepartment",
    "JobPosition"."name" as "jobPosition",
    "Gender"."name" as "gender",
    "Country"."name" as "country",
    "State"."name" as "state",
    "City"."name" as "city",
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', "PayrollAdvance"."id",
        'requestedAmount', "PayrollAdvance"."requestedAmount",
        'totalAmount', "PayrollAdvance"."totalAmount",
        'status', "PayrollAdvance"."status",
        'createdAt', "PayrollAdvance"."createdAt",
        'approvedAt', "PayrollAdvance"."approvedAt",
        'paidAt', "PayrollAdvance"."paidAt",
        'cancelledAt', "PayrollAdvance"."cancelledAt",
        'deniedAt', "PayrollAdvance"."deniedAt",
        'requestReason', "RequestReason"."name",
        'requestReasonDescription', "PayrollAdvance"."requestReasonDescription"
      )
    ) FILTER (WHERE "PayrollAdvance"."id" IS NOT NULL), '[]') as "payrollAdvances"
    FROM "advance_api"."Employee"
    INNER JOIN "advance_api"."User" ON "advance_api"."User"."id" = "Employee"."userId"
    LEFT JOIN "advance_api"."Company" ON "Company"."id" = "Employee"."companyId"
    LEFT JOIN "advance_api"."JobDepartment" ON "JobDepartment"."id" = "Employee"."jobDepartmentId"
    LEFT JOIN "advance_api"."JobPosition" ON "JobPosition"."id" = "Employee"."jobPositionId"
    LEFT JOIN "advance_api"."Gender" ON "Gender"."id" = "Employee"."genderId"
    LEFT JOIN "advance_api"."Country" ON "Country"."id" = "Employee"."countryId"
    LEFT JOIN "advance_api"."State" ON "State"."id" = "Employee"."stateId"
    LEFT JOIN "advance_api"."City" ON "City"."id" = "Employee"."cityId"
    LEFT JOIN "advance_api"."BankAccount" ON "BankAccount"."id" = "Employee"."bankAccountId"
    LEFT JOIN "advance_api"."Bank" ON "Bank"."id" = "BankAccount"."bankId"
    LEFT JOIN "advance_api"."IdentityDocument" ON "IdentityDocument"."id" = "BankAccount"."identityDocumentId"
    LEFT JOIN "advance_api"."BankAccountType" ON "BankAccountType"."id" = "BankAccount"."accountTypeId"
    LEFT JOIN "advance_api"."IdentityDocumentType" ON "IdentityDocumentType"."id" = "IdentityDocument"."documentTypeId"
    LEFT JOIN "advance_api"."PayrollAdvance" ON "PayrollAdvance"."employeeId" = "Employee"."id"
    LEFT JOIN "advance_api"."RequestReason" ON "PayrollAdvance"."requestReasonId" = "RequestReason"."id"
    GROUP BY 
      "Employee"."id",
      "Company"."name",
      "User"."firstName",
      "User"."lastName",
      "User"."email",
      "IdentityDocument"."value",
      "IdentityDocumentType"."name",
      "Bank"."name",
      "BankAccountType"."name",
      "JobDepartment"."name",
      "JobPosition"."name",
      "Gender"."name",
      "Country"."name",
      "State"."name",
      "City"."name"`

    expect(queryResult.length).toEqual(3)
    expect(queryResult[0]).toEqual<
      Pick<
        Employee,
        | 'id'
        | 'createdAt'
        | 'inactivatedAt'
        | 'companyId'
        | 'address'
        | 'numberOfChildren'
        | 'birthDay'
        | 'status'
        | 'salaryFiat'
        | 'advanceAvailableAmount'
        | 'advanceMaxAmount'
      > & {
        firstName: string
        lastName: string
        email: string
        gender: string
        country: string
        state: string
        city: string
        jobPosition: string
        jobDepartment: string
        bankAccountType: string
        bank: string
        identityDocumentValue: string
        identityDocumentType: string
        companyName: string
        payrollAdvances: PayrollAdvance[]
      }
    >({
      id: expect.any(String),
      createdAt: expect.any(Date),
      inactivatedAt: expect.any(Date),
      companyId: company.id,
      status: EmployeeStatus.ACTIVE,
      address: expect.any(String),
      numberOfChildren: expect.any(Number),
      birthDay: expect.any(Date),
      salaryFiat: expect.any(Number),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      advanceAvailableAmount: expect.any(Number),
      advanceMaxAmount: expect.any(Number),
      country: expect.any(String),
      state: expect.any(String),
      city: expect.any(String),
      gender: expect.any(String),
      jobPosition: expect.any(String),
      jobDepartment: expect.any(String),
      bank: expect.any(String),
      bankAccountType: expect.any(String),
      identityDocumentValue: expect.any(String),
      identityDocumentType: expect.any(String),
      companyName: company.name,
      payrollAdvances: expect.any(Array),
    })

    queryResult[0].payrollAdvances.forEach((p) => {
      expect(p).toEqual({
        id: expect.any(Number),
        requestedAmount: expect.any(Number),
        totalAmount: expect.any(Number),
        createdAt: expect.any(String),
        approvedAt: expect.any(String || null),
        paidAt: expect.any(String || null),
        cancelledAt: expect.any(String || null),
        deniedAt: expect.any(String || null),
        status: expect.any(String),
        requestReason: expect.any(String),
        requestReasonDescription: 'Motivo personalizado',
      })
    })
  })
})
