import type { UploadEmployeeSchemaInput } from '~/schemas/upload-employees.schema'

import { faker } from '@faker-js/faker'
import { prisma } from '~/db.server'

import { truncateDB } from 'test/helpers/truncateDB'
import { CompanyFactory } from '../company/company.factory'
import { CountryFactory } from '../country/country.factory'
import { MembershipFactory } from '../membership/membership.factory'
import { BankFactory } from '../bank/bank.factory'
import { BankAccountTypeFactory } from '../bank-account-type/bank-account-type.factory'
import { IdentityDocumentTypeFactory } from '../identity-document-type/identity-document-type.factory'
import { uploadEmployees } from './employee.server'
import { EmployeeStatus } from '@prisma/client'

beforeEach(async () => {
  await truncateDB()
})

describe('uploadEmployees', () => {
  test(`
        When the users in the list don't exist
        Should create users and return createdUsersCount`, async () => {
    const [
      company,
      membership,
      country,
      bank,
      bankAccountType,
      identityDocumentType,
    ] = await Promise.all([
      CompanyFactory.create(),
      MembershipFactory.create(),
      CountryFactory.create(),
      BankFactory.create(),
      BankAccountTypeFactory.create(),
      IdentityDocumentTypeFactory.create(),
    ])

    const dummyCsvData: UploadEmployeeSchemaInput[] = []

    for (let i = 0; i < 3; i++) {
      dummyCsvData.push({
        CORREO_ELECTRONICO: faker.internet.email(),
        NOMBRE: faker.name.firstName(),
        APELLIDO: faker.name.lastName(),
        MEMBRESIA: membership.name,
        ESTADO: 'Activo',
        CARGO: faker.name.jobTitle(),
        DEPARTAMENTO: faker.name.jobArea(),
        PAIS: country.name,
        BANCO: bank.name,
        TIPO_DE_CUENTA: bankAccountType.name,
        NUMERO_DE_CUENTA: faker.datatype.number().toString(),
        TIPO_DE_DOCUMENTO: identityDocumentType.name,
        DOCUMENTO_DE_IDENTIDAD: faker.datatype.number().toString(),
        SALARIO: faker.datatype.number().toString(),
        CUPO_APROBADO: faker.datatype.number().toString(),
        CUPO_DISPONIBLE: faker.datatype.number().toString(),
        FECHA_DE_INGRESO: '2020-12-20',
        FECHA_DE_RETIRO: undefined,
        CELULAR: '+58 424 9999 999',
      })
    }

    const response = await uploadEmployees(dummyCsvData, company.id)

    expect(response.createdUsersCount).toEqual(3)
    expect(response.updatedUsersCount).toEqual(0)
    expect(response.usersWithErrors.length).toEqual(0)

    const expectedUser = dummyCsvData[0]
    const createdUser = await prisma.user.findFirst({
      where: {
        email: { equals: expectedUser.CORREO_ELECTRONICO, mode: 'insensitive' },
      },
      include: {
        employee: {
          include: {
            country: true,
            company: true,
            gender: true,
            jobDepartment: true,
            jobPosition: true,
            membership: true,
            bankAccount: {
              include: {
                bank: true,
                accountType: true,
                identityDocument: {
                  include: {
                    documentType: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(createdUser?.firstName).toEqual(expectedUser.NOMBRE)
    expect(createdUser?.lastName).toEqual(expectedUser.APELLIDO)

    expect(createdUser?.employee?.company.id).toEqual(company.id)
    expect(createdUser?.employee?.country?.id).toEqual(country.id)
    expect(createdUser?.employee?.membership?.id).toEqual(membership.id)
    expect(createdUser?.employee?.status).toEqual(EmployeeStatus.ACTIVE)
    expect(createdUser?.employee?.phone).toEqual(expectedUser.CELULAR)

    expect(createdUser?.employee?.bankAccount?.accountNumber).toEqual(
      expectedUser.NUMERO_DE_CUENTA
    )
    expect(createdUser?.employee?.bankAccount?.accountType.name).toEqual(
      expectedUser.TIPO_DE_CUENTA
    )
    expect(createdUser?.employee?.bankAccount?.bank.name).toEqual(
      expectedUser.BANCO
    )
    expect(createdUser?.employee?.bankAccount?.identityDocument.value).toEqual(
      expectedUser.DOCUMENTO_DE_IDENTIDAD
    )
    expect(
      createdUser?.employee?.bankAccount?.identityDocument.documentType.name
    ).toEqual(expectedUser.TIPO_DE_DOCUMENTO)

    expect(createdUser?.employee?.jobPosition?.name).toEqual(expectedUser.CARGO)
    expect(createdUser?.employee?.jobDepartment?.name).toEqual(
      expectedUser.DEPARTAMENTO
    )

    expect(createdUser?.employee?.salaryFiat).toEqual(
      parseFloat(expectedUser.SALARIO)
    )

    expect(createdUser?.employee?.advanceAvailableAmount).toEqual(
      parseFloat(expectedUser.CUPO_DISPONIBLE)
    )
    expect(createdUser?.employee?.advanceMaxAmount).toEqual(
      parseFloat(expectedUser.CUPO_APROBADO)
    )
  })

  test(`
        When the users in the list already exist
        Should update users and return the updatedUsersCount`, async () => {
    const [
      company,
      membership,
      country,
      bank,
      bankAccountType,
      identityDocumentType,
    ] = await Promise.all([
      CompanyFactory.create(),
      MembershipFactory.create(),
      CountryFactory.create(),
      BankFactory.create(),
      BankAccountTypeFactory.create(),
      IdentityDocumentTypeFactory.create(),
    ])

    const testEmail = faker.internet.email()

    const createDummyData = () => ({
      CORREO_ELECTRONICO: testEmail,
      NOMBRE: faker.name.firstName(),
      APELLIDO: faker.name.lastName(),
      MEMBRESIA: membership.name,
      ESTADO: 'Activo',
      CARGO: faker.name.jobTitle(),
      DEPARTAMENTO: faker.name.jobArea(),
      PAIS: country.name,
      BANCO: bank.name,
      TIPO_DE_CUENTA: bankAccountType.name,
      NUMERO_DE_CUENTA: faker.datatype.number().toString(),
      TIPO_DE_DOCUMENTO: identityDocumentType.name,
      DOCUMENTO_DE_IDENTIDAD: faker.datatype.number().toString(),
      SALARIO: faker.datatype.number().toString(),
      CUPO_APROBADO: faker.datatype.number().toString(),
      CUPO_DISPONIBLE: faker.datatype.number().toString(),
      CELULAR: faker.datatype.number().toString(),
    })

    const existingUser = createDummyData()
    const newUserData = createDummyData()

    await uploadEmployees([existingUser], company.id)

    const { createdUsersCount, updatedUsersCount, usersWithErrors } =
      await uploadEmployees([newUserData], company.id)

    expect(createdUsersCount).toEqual(0)
    expect(updatedUsersCount).toEqual(1)
    expect(usersWithErrors.length).toEqual(0)

    const updatedUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: newUserData.CORREO_ELECTRONICO,
          mode: 'insensitive',
        },
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        employee: {
          select: {
            acceptedPrivacyPolicy: true,
            acceptedTermsOfService: true,
            address: true,
            status: true,
            salaryFiat: true,
            advanceAvailableAmount: true,
            advanceMaxAmount: true,
            membershipId: true,
            phone: true,
            countryId: true,
            companyId: true,
            jobDepartment: { select: { name: true } },
            jobPosition: { select: { name: true } },
            bankAccount: {
              select: {
                accountNumber: true,
                bankId: true,
                bank: { select: { name: true } },
                accountType: { select: { name: true } },
                identityDocument: {
                  select: {
                    value: true,
                    documentType: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(updatedUser).toBeDefined()

    expect(updatedUser).toEqual({
      firstName: newUserData.NOMBRE,
      lastName: newUserData.APELLIDO,
      email: newUserData.CORREO_ELECTRONICO.toLowerCase(),
      password: null,
      employee: expect.any(Object),
    })

    expect(updatedUser!.employee!).toEqual({
      acceptedPrivacyPolicy: false,
      acceptedTermsOfService: false,
      address: null,
      companyId: company.id,
      countryId: country.id,
      membershipId: membership.id,
      status: EmployeeStatus.ACTIVE,
      phone: newUserData.CELULAR,
      salaryFiat: parseFloat(newUserData.SALARIO),
      advanceAvailableAmount: parseFloat(newUserData.CUPO_DISPONIBLE),
      advanceMaxAmount: parseFloat(newUserData.CUPO_APROBADO),
      jobPosition: {
        name: newUserData.CARGO,
      },
      jobDepartment: {
        name: newUserData.DEPARTAMENTO,
      },
      bankAccount: {
        bankId: bank.id,
        accountNumber: newUserData.NUMERO_DE_CUENTA,
        bank: {
          name: newUserData.BANCO,
        },
        accountType: {
          name: newUserData.TIPO_DE_CUENTA,
        },
        identityDocument: {
          value: newUserData.DOCUMENTO_DE_IDENTIDAD,
          documentType: {
            name: newUserData.TIPO_DE_DOCUMENTO,
          },
        },
      },
    })
  })
})
