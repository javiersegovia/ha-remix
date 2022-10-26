import type { Employee } from '@prisma/client'

import { EmployeeStatus } from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'

beforeEach(async () => {
  await truncateDB()
})

describe('DATASTUDIO Employees Query', () => {
  test('should return a list of employees', async () => {
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

    const createGender = prisma.gender.create({
      data: {
        name: 'Masculino',
      },
    })

    const createJobDepartment = prisma.jobDepartment.create({
      data: {
        name: 'Tecnología',
      },
    })

    const createJobPosition = prisma.jobPosition.create({
      data: {
        name: 'Desarrollador de Software',
      },
    })

    const createBank = prisma.bank.create({
      data: {
        name: 'Bank of America',
      },
    })

    const createCompany = prisma.company.create({
      data: {
        name: 'HoyAdelantas',
      },
    })

    const [country, gender, jobDepartment, jobPosition, bank, company] =
      await Promise.all([
        createCountry,
        createGender,
        createJobDepartment,
        createJobPosition,
        createBank,
        createCompany,
      ])

    const createEmployeesPromises: Promise<Employee>[] = []

    for (let i = 0; i < 3; i++) {
      createEmployeesPromises.push(
        prisma.employee.create({
          data: {
            company: {
              connect: {
                id: company.id,
              },
            },
            country: {
              connect: {
                id: country.id,
              },
            },
            state: {
              connect: {
                id: country.states[0].id,
              },
            },
            city: {
              connect: {
                id: country.states[0].cities[0].id,
              },
            },
            gender: {
              connect: {
                id: gender.id,
              },
            },
            jobDepartment: {
              connect: {
                id: jobDepartment.id,
              },
            },
            jobPosition: {
              connect: {
                id: jobPosition.id,
              },
            },
            user: {
              create: {
                email: `${i}__sample@test.com`,
                firstName: 'Jack',
                lastName: 'Sparrow',
              },
            },
            bankAccount: {
              create: {
                bank: {
                  connect: {
                    id: bank.id,
                  },
                },
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

    await Promise.all(createEmployeesPromises)

    const queryResult = await prisma.$queryRaw<Employee[]>`SELECT DISTINCT
      "Employee"."id",
      "Employee"."createdAt",
      "companyId",
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
      "City"."name" as "city"
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
      LEFT JOIN "advance_api"."IdentityDocumentType" ON "IdentityDocumentType"."id" = "IdentityDocument"."documentTypeId";`

    expect(queryResult.length).toBe(3)
    expect(queryResult[0]).toEqual<
      Pick<
        Employee,
        | 'id'
        | 'createdAt'
        | 'companyId'
        | 'status'
        | 'address'
        | 'numberOfChildren'
        | 'birthDay'
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
      }
    >({
      id: expect.any(String),
      createdAt: expect.any(Date),
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
      companyName: 'HoyAdelantas',
    })
  })
})
