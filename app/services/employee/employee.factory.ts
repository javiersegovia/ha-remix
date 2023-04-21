import type {
  BankAccount,
  City,
  Company,
  Country,
  Cryptocurrency,
  Currency,
  Employee,
  Gender,
  JobDepartment,
  JobPosition,
  Membership,
  State,
  User,
  UserRole,
  Wallet,
} from '@prisma/client'

import { EmployeeRole, EmployeeStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedEmployee = Employee & {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> & {
    role?: UserRole
  }
  company: Company
  country?: Country
  state?: State
  city?: City
  currency?: Currency
  cryptocurrency?: Cryptocurrency
  gender?: Gender
  membership?: Membership
  bankAccount?: BankAccount
  jobPosition?: JobPosition
  jobDepartment?: JobDepartment
  wallet?: Wallet
}

export const EmployeeFactory = Factory.define<ExtendedEmployee>(
  ({ onCreate, associations }) => {
    const { company } = associations

    if (!company) {
      throw new Error('Missing associations at EmployeeFactory')
    }

    onCreate((employee) => {
      const {
        user,
        acceptedPrivacyPolicy,
        acceptedTermsOfService,
        status,
        createdAt,
        updatedAt,
        startedAt,
        inactivatedAt,
        documentIssueDate,
        birthDay,
        roles,
        salaryFiat,
        advanceMaxAmount,
        advanceAvailableAmount,
        numberOfChildren,
        phone,
        address,
      } = employee
      const { email, firstName, lastName, role } = user

      return prisma.employee.create({
        data: {
          acceptedPrivacyPolicy,
          acceptedTermsOfService,
          status,
          createdAt,
          updatedAt,
          startedAt,
          inactivatedAt,
          documentIssueDate,
          birthDay,
          roles,
          salaryFiat,
          advanceMaxAmount,
          advanceAvailableAmount,
          numberOfChildren,
          phone,
          address,
          company: connect(company.id),
          bankAccount: connect(associations.bankAccount?.id),
          cryptocurrency: connect(associations.cryptocurrency?.id),
          country: connect(associations.country?.id),
          currency: connect(associations.currency?.id),
          jobDepartment: connect(associations.jobDepartment?.id),
          jobPosition: connect(associations.jobPosition?.id),

          user: {
            create: {
              email,
              firstName,
              lastName,
              role: connect(role?.id),
            },
          },
        },
        include: {
          user: true,
          company: true,
        },
      })
    })

    const userId = faker.datatype.uuid()

    return {
      id: faker.datatype.uuid(),

      acceptedPrivacyPolicy: true,
      acceptedTermsOfService: true,

      status: EmployeeStatus.ACTIVE,

      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      inactivatedAt: new Date(),
      documentIssueDate: new Date(),
      birthDay: new Date(),

      roles: [EmployeeRole.MEMBER],

      salaryFiat: faker.datatype.number(),
      advanceMaxAmount: faker.datatype.number(),
      advanceAvailableAmount: faker.datatype.number(),

      salaryCrypto: faker.datatype.number(),
      advanceCryptoMaxAmount: faker.datatype.number(),
      advanceCryptoAvailableAmount: faker.datatype.number(),

      availablePoints: faker.datatype.number(),
      numberOfChildren: faker.datatype.number(),
      phone: faker.phone.number(),
      address: faker.address.streetAddress(),

      companyId: company.id,
      company,

      userId,
      user: {
        id: userId,
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        roleId: associations.user?.role?.id || null,
      },

      bankAccountId: associations.bankAccount?.id || null,

      countryId: associations.country?.id || null,
      stateId: associations.state?.id || null,
      cityId: associations.city?.id || null,

      currencyId: associations.currency?.id || null,
      cryptocurrencyId: associations.cryptocurrency?.id || null,

      membershipId: associations.membership?.id || null,

      genderId: associations.gender?.id || null,
      jobDepartmentId: associations?.jobDepartment?.id || null,
      jobPositionId: associations.jobPosition?.id || null,

      walletId: associations.wallet?.id || null,
    }
  }
)
