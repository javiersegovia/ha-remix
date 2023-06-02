import type {
  Bank,
  BankAccount,
  Company,
  Employee,
  Wallet,
} from '@prisma/client'
import type { UploadEmployeeSchemaInput } from '~/schemas/upload-employees.schema'
import type { WelcomeSchemaInput } from '~/schemas/welcome.schema'
import type { EditAccountSchemaInput } from '~/schemas/edit-account.schema'
import type {
  CompanyDashboardEmployeeSchemaInput,
  EmployeeAccountSchemaInput,
  EmployeeBankAccountSchemaInput,
  EmployeeExtraInformationSchemaInput,
  EmployeeSchemaInput,
} from './employee.schema'

import {
  EmployeeRole,
  Prisma,
  PayrollAdvancePaymentMethod,
} from '@prisma/client'
import { EmployeeStatus } from '@prisma/client'
import { Response } from '@remix-run/node'
import { badRequest, notFound } from '~/utils/responses'
import { hash } from 'bcryptjs'
import { prisma } from '~/db.server'
import {
  connect,
  connectMany,
  connectOrDisconnect,
  setMany,
} from '~/utils/relationships'
import { generateExpirationDate, generateRandomToken } from '../auth.server'
import { sendInvitation } from '../email/email.server'
import { sanitizeDate } from '~/utils/formatDate'
import { uploadEmployeeSchema } from '~/schemas/upload-employees.schema'
import { capitalize } from '~/utils/strings'

const INVITATION_EXPIRES_IN = '20d' as const

export const getEmployeeById = async (employeeId: Employee['id']) => {
  return prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    include: {
      country: true,
      state: true,
      city: true,
      gender: true,
      jobDepartment: true,
      jobPosition: true,
      currency: true,
      company: {
        include: {
          benefits: true,
        },
      },
      membership: {
        include: {
          benefits: true,
        },
      },
      benefits: {
        select: {
          id: true,
          name: true,
          companyBenefit: {
            select: {
              id: true,
            },
          },
        },
      },
      employeeGroups: {
        select: {
          id: true,
          name: true,
          benefits: {
            select: {
              id: true,
              companyBenefit: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      cryptocurrency: true,
      wallet: {
        select: {
          address: true,
          cryptocurrencyId: true,
          networkId: true,
        },
      },
      bankAccount: {
        include: {
          accountType: true,
          bank: true,
          identityDocument: {
            include: {
              documentType: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          roleId: true,
        },
      },
    },
  })
}

/** This function is used inside the SuperAdmin Dashboard */
export const getEmployeesByCompanyId = async (
  companyId: string,
  options?: Pick<Prisma.EmployeeFindManyArgs, 'take' | 'skip' | 'cursor'>
) => {
  const { take, skip, cursor } = options || {}

  return prisma.employee.findMany({
    where: {
      companyId: companyId,
    },
    take,
    skip,
    cursor,
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
    select: {
      id: true,
      status: true,
      advanceMaxAmount: true,
      advanceCryptoMaxAmount: true,
      advanceAvailableAmount: true,
      advanceCryptoAvailableAmount: true,
      membership: {
        select: {
          name: true,
        },
      },
      benefits: {
        select: {
          _count: true,
        },
      },
      city: {
        select: {
          name: true,
        },
      },
      jobDepartment: {
        select: {
          name: true,
        },
      },
      employeeGroups: {
        select: {
          id: true,
          benefits: {
            select: {
              _count: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })
}

/** This function is used inside the Company Admin Dashboard */
export const getCompanyEmployeesByCompanyId = async (
  companyId: string,
  options?: Pick<Prisma.EmployeeFindManyArgs, 'take' | 'skip' | 'cursor'>
) => {
  const { take, skip, cursor } = options || {}

  return prisma.employee.findMany({
    where: {
      companyId: companyId,
    },
    take,
    skip,
    cursor,
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
    select: {
      id: true,
      status: true,
      membership: {
        select: {
          id: true,
          name: true,
          benefits: {
            select: {
              id: true,
            },
          },
        },
      },
      benefits: {
        select: {
          id: true,
          companyBenefit: {
            select: {
              id: true,
            },
          },
        },
      },
      city: {
        select: {
          name: true,
        },
      },
      jobDepartment: {
        select: {
          name: true,
        },
      },
      employeeGroups: {
        select: {
          id: true,
          benefits: {
            select: {
              id: true,
              companyBenefit: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })
}

export const requireEmployee = async (
  queryOptions: Prisma.EmployeeFindFirstArgs & {
    where: Prisma.EmployeeFindFirstArgs['where']
  }
) => {
  const employee = await prisma.employee.findFirst({
    ...queryOptions,
  })

  if (!employee) {
    throw notFound({
      message: 'La compañía no ha sido encontrada',
      redirect: '/',
    })
  }

  return employee
}

export const createEmployee = async (
  data: EmployeeSchemaInput,
  companyId: Company['id']
) => {
  const {
    user,
    status = EmployeeStatus.INACTIVE,
    bankAccount,
    wallet,

    birthDay,
    documentIssueDate,

    membershipId,
    genderId,
    countryId,
    jobDepartmentId,
    jobPositionId,
    currencyId,
    cryptocurrencyId,
    stateId,
    cityId,

    address,
    numberOfChildren,
    phone,

    salaryFiat,
    salaryCrypto,
    roles,
    advanceAvailableAmount,
    advanceCryptoAvailableAmount,
    advanceCryptoMaxAmount,
    advanceMaxAmount,
    startedAt,
    inactivatedAt,
  } = data

  const userExists = await prisma.user.findFirst({
    where: {
      email: {
        equals: user.email,
        mode: 'insensitive',
      },
    },
  })

  if (userExists) {
    return {
      fieldErrors: { 'user.email': 'El correo ya está en uso' },
      employee: null,
    }
  }

  const createBankAccount: Prisma.EmployeeCreateInput['bankAccount'] =
    bankAccount &&
    bankAccount.bankId &&
    bankAccount.accountNumber &&
    bankAccount.accountTypeId &&
    bankAccount.identityDocument?.documentTypeId &&
    bankAccount.identityDocument?.value
      ? {
          create: {
            accountNumber: bankAccount.accountNumber,
            bank: connect(bankAccount.bankId),

            accountType: connect(bankAccount.accountTypeId),

            identityDocument: {
              create: {
                value: bankAccount.identityDocument.value,
                documentType: connect(
                  bankAccount.identityDocument.documentTypeId
                ),
              },
            },
          },
        }
      : undefined

  const createWallet: Prisma.EmployeeCreateInput['wallet'] =
    wallet && wallet.address && wallet.cryptoNetworkId
      ? {
          create: {
            address: wallet.address,
            network: connect(wallet.cryptoNetworkId),
          },
        }
      : undefined

  try {
    const {
      firstName,
      lastName,
      loginToken,
      loginExpiration,
      email: formattedEmail,
    } = await generateCreateUserInput(user)

    const employee = await prisma.employee.create({
      data: {
        startedAt: sanitizeDate(startedAt) || null,
        inactivatedAt: sanitizeDate(inactivatedAt) || null,
        salaryFiat,
        salaryCrypto,
        advanceAvailableAmount,
        advanceCryptoAvailableAmount,
        advanceCryptoMaxAmount,
        advanceMaxAmount,
        address,
        phone,
        numberOfChildren: numberOfChildren || 0,
        roles: roles || undefined,

        birthDay: sanitizeDate(birthDay) || null,
        documentIssueDate: sanitizeDate(documentIssueDate) || null,

        gender: connect(genderId),
        country: connect(countryId),
        state: connect(stateId),
        city: connect(cityId),
        membership: connect(membershipId),

        user: {
          create: {
            email: formattedEmail,
            firstName,
            lastName,
            loginToken,
            loginExpiration,
            password: user.password ? await hash(user.password, 10) : undefined,
            role: connect(user.roleId),
            roleId: undefined,
          },
        },
        status,
        company: connect(companyId),
        jobDepartment: connect(jobDepartmentId),
        jobPosition: connect(jobPositionId),

        currency: connect(currencyId) || {
          connectOrCreate: {
            where: {
              code: 'COP',
            },
            create: {
              code: 'COP',
              name: 'Peso Colombiano',
            },
          },
        },
        cryptocurrency: connect(cryptocurrencyId),
        bankAccount: createBankAccount,
        wallet: createWallet,
      },
    })

    sendInvitation({
      firstName: user.firstName,
      destination: user.email,
      token: loginToken,
    })

    return { employee }
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    return { error: err, employee: null }
  }
}

export const createEmployeeByCompanyAdminAccountForm = async (
  data: EmployeeAccountSchemaInput,
  companyId: Company['id']
) => {
  const {
    user,
    status = EmployeeStatus.INACTIVE,
    availablePoints,
    benefitsIds,
    employeeGroupsIds,
  } = data

  try {
    const {
      loginExpiration,
      loginToken,
      firstName,
      lastName,
      email,
      verifiedEmail,
    } = await generateCreateUserInput(user)

    const employee = await prisma.employee.create({
      data: {
        user: {
          create: {
            loginExpiration,
            loginToken,
            firstName,
            lastName,
            email,
            verifiedEmail,
            role: connect(user.roleId),
          },
        },
        status,
        availablePoints,

        company: connect(companyId),

        benefits: connectMany(benefitsIds),
        employeeGroups: connectMany(employeeGroupsIds),

        currency: {
          connectOrCreate: {
            where: {
              code: 'COP',
            },
            create: {
              code: 'COP',
              name: 'Peso Colombiano',
            },
          },
        },
      },
    })

    sendInvitation({
      firstName: user.firstName,
      destination: user.email,
      token: loginToken,
    })

    return employee
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    return badRequest({
      message: 'Ocurrió un error durante la creación del colaborador',
      redirect: '/dashboard/manage/employees',
    })
  }
}

export const updateEmployeeById = async (
  data: EmployeeSchemaInput,
  employeeId: Employee['id']
) => {
  const existingEmployee = await requireEmployee({ where: { id: employeeId } })

  const {
    status = EmployeeStatus.INACTIVE,

    birthDay,
    documentIssueDate,

    genderId,
    countryId,
    jobDepartmentId,
    jobPositionId,
    currencyId,
    cryptocurrencyId,
    stateId,
    cityId,
    membershipId,

    address,
    numberOfChildren,
    phone,
    availablePoints,

    salaryFiat,
    salaryCrypto,
    roles,
    advanceAvailableAmount,
    advanceCryptoAvailableAmount,
    advanceCryptoMaxAmount,
    advanceMaxAmount,

    user,
    bankAccount,
    wallet,

    inactivatedAt,
    startedAt,
  } = data

  const upsertWallet: Prisma.EmployeeUpdateInput['wallet'] =
    wallet && wallet?.address && wallet?.cryptoNetworkId
      ? {
          upsert: {
            create: {
              address: wallet.address,
              networkId: wallet?.cryptoNetworkId,
            },
            update: {
              address: wallet.address || undefined,
              networkId: wallet.cryptoNetworkId || null,
            },
          },
        }
      : {
          delete: !!existingEmployee.walletId,
        }

  const upsertBankAccount: Prisma.EmployeeUpdateInput['bankAccount'] =
    bankAccount &&
    bankAccount.bankId &&
    bankAccount.accountNumber &&
    bankAccount.accountTypeId &&
    bankAccount.identityDocument?.documentTypeId &&
    bankAccount.identityDocument?.value
      ? {
          upsert: {
            create: {
              accountNumber: bankAccount.accountNumber,
              bank: connect(bankAccount.bankId),
              accountType: connect(bankAccount.accountTypeId),
              identityDocument: {
                create: {
                  value: bankAccount.identityDocument?.value,
                  documentType: connect(
                    bankAccount.identityDocument?.documentTypeId
                  ),
                },
              },
            },
            update: {
              accountNumber: bankAccount.accountNumber,
              bank: connect(bankAccount.bankId),
              accountType: connect(bankAccount.accountTypeId),
              identityDocument: {
                update: {
                  value: bankAccount.identityDocument?.value,
                  documentType: connect(
                    bankAccount.identityDocument?.documentTypeId
                  ),
                },
              },
            },
          },
        }
      : {
          delete: !!existingEmployee.bankAccountId,
        }

  try {
    const newInactivatedAt =
      existingEmployee.status === EmployeeStatus.ACTIVE &&
      status === EmployeeStatus.INACTIVE
        ? new Date()
        : inactivatedAt

    return await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        startedAt: sanitizeDate(startedAt) || null,
        inactivatedAt: sanitizeDate(newInactivatedAt) || null,
        salaryFiat,
        salaryCrypto,
        advanceAvailableAmount,
        advanceCryptoAvailableAmount,
        advanceCryptoMaxAmount,
        advanceMaxAmount,
        birthDay: sanitizeDate(birthDay) || null,
        documentIssueDate: sanitizeDate(documentIssueDate) || null,
        address,
        phone,
        availablePoints,

        status,
        numberOfChildren: numberOfChildren || 0,
        roles: roles || [],

        membership: connect(membershipId),
        gender: connectOrDisconnect(genderId, !!existingEmployee.genderId),
        country: connectOrDisconnect(countryId, !!existingEmployee.countryId),
        state: connectOrDisconnect(stateId, !!existingEmployee.stateId),
        city: connectOrDisconnect(cityId, !!existingEmployee.cityId),
        jobDepartment: connectOrDisconnect(
          jobDepartmentId,
          !!existingEmployee.jobDepartmentId
        ),
        jobPosition: connectOrDisconnect(
          jobPositionId,
          !!existingEmployee.jobPositionId
        ),
        currency: connectOrDisconnect(
          currencyId,
          !!existingEmployee.currencyId
        ),
        cryptocurrency: connectOrDisconnect(
          cryptocurrencyId,
          !!existingEmployee.cryptocurrencyId
        ),

        bankAccount: upsertBankAccount,
        wallet: upsertWallet,

        user: {
          update: {
            ...user,
            password: user.password ? await hash(user.password, 10) : undefined,
            roleId: user.roleId,
          },
        },
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado',
      redirect: null,
    })
  }
}

export const updateEmployeeByCompanyAdminAccountForm = async (
  data: EmployeeAccountSchemaInput,
  employeeId: Employee['id']
) => {
  const {
    status = EmployeeStatus.INACTIVE,
    availablePoints,
    user,
    benefitsIds,
    employeeGroupsIds,
  } = data

  const existingEmployee = await requireEmployee({ where: { id: employeeId } })

  const newInactivatedAt =
    existingEmployee.status === EmployeeStatus.ACTIVE &&
    status === EmployeeStatus.INACTIVE
      ? new Date()
      : undefined

  try {
    return await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        status,
        availablePoints,
        benefits: setMany(benefitsIds),
        employeeGroups: setMany(employeeGroupsIds),
        inactivatedAt: sanitizeDate(newInactivatedAt),

        user: {
          update: {
            ...user,
            password: user.password ? await hash(user.password, 10) : undefined,
            roleId: user.roleId,
          },
        },
      },
      select: {
        id: true,
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado',
      redirect: null,
    })
  }
}

export const updateEmployeeByCompanyAdminExtraInformationForm = async (
  data: EmployeeExtraInformationSchemaInput,
  employeeId: Employee['id']
) => {
  const {
    jobDepartmentId,
    jobPositionId,
    genderId,
    countryId,
    stateId,
    cityId,
    birthDay,
    documentIssueDate,
    startedAt,
    inactivatedAt,
    address,
    phone,
    numberOfChildren,
  } = data

  const existingEmployee = await requireEmployee({ where: { id: employeeId } })

  try {
    return await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        startedAt: sanitizeDate(startedAt) || null,
        inactivatedAt: sanitizeDate(inactivatedAt) || null,
        documentIssueDate: sanitizeDate(documentIssueDate) || null,
        birthDay: sanitizeDate(birthDay) || null,

        address,
        phone,
        numberOfChildren: numberOfChildren || 0,

        gender: connectOrDisconnect(genderId, !!existingEmployee.genderId),
        country: connectOrDisconnect(countryId, !!existingEmployee.countryId),
        state: connectOrDisconnect(stateId, !!existingEmployee.stateId),
        city: connectOrDisconnect(cityId, !!existingEmployee.cityId),

        jobDepartment: connectOrDisconnect(
          jobDepartmentId,
          !!existingEmployee.jobDepartmentId
        ),
        jobPosition: connectOrDisconnect(
          jobPositionId,
          !!existingEmployee.jobPositionId
        ),
      },
      select: {
        id: true,
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado al actualizar el colaborador',
      redirect: null,
    })
  }
}

export const updateEmployeeByCompanyAdminBankAccountForm = async (
  data: EmployeeBankAccountSchemaInput,
  employeeId: Employee['id']
) => {
  const { bankId, accountNumber, accountTypeId, identityDocument } = data

  try {
    return await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        bankAccount: {
          upsert: {
            create: {
              accountNumber,
              bank: connect(bankId),
              accountType: connect(accountTypeId),
              identityDocument: {
                create: {
                  value: identityDocument.value,
                  documentType: connect(identityDocument.documentTypeId),
                },
              },
            },
            update: {
              accountNumber,
              bank: connect(bankId),
              accountType: connect(accountTypeId),
              identityDocument: {
                update: {
                  value: identityDocument.value,
                  documentType: connect(identityDocument.documentTypeId),
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message:
        'Ha ocurrido un error inesperado al actualizar la información bancaria',
      redirect: null,
    })
  }
}

export const updateEmployeeByCompanyAdminForm = async (
  data: CompanyDashboardEmployeeSchemaInput,
  employeeId: Employee['id']
) => {
  const existingEmployee = await requireEmployee({ where: { id: employeeId } })

  const {
    status = EmployeeStatus.INACTIVE,

    birthDay,
    documentIssueDate,

    genderId,
    countryId,
    jobDepartmentId,
    jobPositionId,

    stateId,
    cityId,

    address,
    numberOfChildren,
    phone,

    user,
    bankAccount,

    inactivatedAt,
    startedAt,
  } = data

  const upsertBankAccount: Prisma.EmployeeUpdateInput['bankAccount'] =
    bankAccount
      ? {
          upsert: {
            create: {
              accountNumber: bankAccount.accountNumber,
              bank: connect(bankAccount.bankId),
              accountType: connect(bankAccount.accountTypeId),
              identityDocument: {
                create: {
                  value: bankAccount.identityDocument?.value,
                  documentType: connect(
                    bankAccount.identityDocument?.documentTypeId
                  ),
                },
              },
            },
            update: {
              accountNumber: bankAccount.accountNumber,
              bank: connect(bankAccount.bankId),
              accountType: connect(bankAccount.accountTypeId),
              identityDocument: {
                update: {
                  value: bankAccount.identityDocument?.value,
                  documentType: connect(
                    bankAccount.identityDocument?.documentTypeId
                  ),
                },
              },
            },
          },
        }
      : {
          delete: !!existingEmployee.bankAccountId,
        }

  try {
    const newInactivatedAt =
      existingEmployee.status === EmployeeStatus.ACTIVE &&
      status === EmployeeStatus.INACTIVE
        ? new Date()
        : inactivatedAt

    return await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        startedAt: sanitizeDate(startedAt) || null,
        inactivatedAt: sanitizeDate(newInactivatedAt) || null,

        birthDay: sanitizeDate(birthDay) || null,
        documentIssueDate: sanitizeDate(documentIssueDate) || null,
        address,
        phone,
        status,
        numberOfChildren: numberOfChildren || undefined,

        gender: connectOrDisconnect(genderId, !!existingEmployee.genderId),
        country: connectOrDisconnect(countryId, !!existingEmployee.countryId),
        state: connectOrDisconnect(stateId, !!existingEmployee.stateId),
        city: connectOrDisconnect(cityId, !!existingEmployee.cityId),
        jobDepartment: connectOrDisconnect(
          jobDepartmentId,
          !!existingEmployee.jobDepartmentId
        ),
        jobPosition: connectOrDisconnect(
          jobPositionId,
          !!existingEmployee.jobPositionId
        ),

        bankAccount: upsertBankAccount,

        user: {
          update: {
            ...user,
            password: user.password ? await hash(user.password, 10) : undefined,
            roleId: user.roleId,
          },
        },
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado',
      redirect: null,
    })
  }
}

export const updateEmployeeByWelcomeForm = async (
  data: WelcomeSchemaInput,
  employeeId: Employee['id']
) => {
  const existingEmployee = await requireEmployee({ where: { id: employeeId } })

  const {
    password,
    birthDay,
    documentIssueDate,
    genderId,

    countryId,
    stateId,
    cityId,

    address,
    numberOfChildren,
    phone,
    user,
  } = data

  try {
    await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        birthDay: sanitizeDate(birthDay) || null,
        documentIssueDate: sanitizeDate(documentIssueDate) || null,
        address,
        phone,
        numberOfChildren: numberOfChildren || 0,

        gender: connectOrDisconnect(genderId, !!existingEmployee.genderId),
        country: connectOrDisconnect(countryId, !!existingEmployee.countryId),
        state: connectOrDisconnect(stateId, !!existingEmployee.stateId),
        city: connectOrDisconnect(cityId, !!existingEmployee.cityId),

        acceptedPrivacyPolicy: true,
        acceptedTermsOfService: true,

        user: {
          update: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            password: await hash(password, 10),
          },
        },
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado',
      redirect: null,
    })
  }
}

export const updateEmployeeByAccountForm = async (
  data: EditAccountSchemaInput,
  employeeId: Employee['id']
) => {
  const existingEmployee = await requireEmployee({ where: { id: employeeId } })

  const {
    birthDay,
    documentIssueDate,
    genderId,
    wallet,
    countryId,
    stateId,
    cityId,

    address,
    numberOfChildren,
    phone,
    user,
  } = data

  const upsertWallet: Prisma.EmployeeUpdateInput['wallet'] =
    wallet && wallet?.address && wallet?.cryptoNetworkId
      ? {
          upsert: {
            create: {
              address: wallet.address,
              networkId: wallet?.cryptoNetworkId,
            },
            update: {
              address: wallet.address || undefined,
              networkId: wallet.cryptoNetworkId || null,
            },
          },
        }
      : {
          delete: !!existingEmployee.walletId,
        }

  try {
    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        birthDay: sanitizeDate(birthDay) || null,
        documentIssueDate: sanitizeDate(documentIssueDate) || null,
        address,
        phone,
        numberOfChildren: numberOfChildren || 0,

        gender: connectOrDisconnect(genderId, !!existingEmployee.genderId),
        country: connectOrDisconnect(countryId, !!existingEmployee.countryId),
        state: connectOrDisconnect(stateId, !!existingEmployee.stateId),
        city: connectOrDisconnect(cityId, !!existingEmployee.cityId),

        wallet: upsertWallet,

        user: {
          update: {
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
        },
      },
    })

    return updatedEmployee
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado',
      redirect: null,
    })
  }
}

export const uploadEmployees = async (
  data: UploadEmployeeSchemaInput[],
  companyId: Company['id']
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: null,
    })
  }

  const errorResponses: Record<string, string[]> = {}
  let createdUsersCount = 0
  let updatedUsersCount = 0
  const usersWithErrors: any[] = []

  const jobDepartments = data
    .map((item) =>
      item.DEPARTAMENTO
        ? { name: capitalize(item.DEPARTAMENTO.trim()) }
        : undefined
    )
    .filter(Boolean) as { name: string }[]

  const jobPositions = data
    .map((item) =>
      item.CARGO ? { name: capitalize(item.CARGO.trim()) } : undefined
    )
    .filter(Boolean) as { name: string }[]

  if (jobDepartments.length > 0) {
    await prisma.jobDepartment.createMany({
      data: jobDepartments,
      skipDuplicates: true,
    })
  }
  if (jobPositions.length > 0) {
    await prisma.jobPosition.createMany({
      data: jobPositions,
      skipDuplicates: true,
    })
  }

  const promises = data.map(async (item, itemIndex) => {
    const parsed = uploadEmployeeSchema.safeParse(item)

    errorResponses[itemIndex] = []

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        errorResponses[itemIndex].push(issue.message)
      )
      return usersWithErrors.push({
        ...item,
        ERRORES: errorResponses[itemIndex].join('\n'),
      })
    } else {
      const {
        CORREO_ELECTRONICO: email,
        NOMBRE: firstName,
        APELLIDO: lastName,
        ESTADO: status,

        CARGO: jobPositionName,
        DEPARTAMENTO: jobDepartmentName,

        SALARIO: salary,
        CUPO_APROBADO: maxAvailableAmount,
        CUPO_DISPONIBLE: availableAmount,

        PAIS: countryName,
        BANCO: bankName,
        TIPO_DE_CUENTA: accountTypeName,
        NUMERO_DE_CUENTA: accountNumber,
        TIPO_DE_DOCUMENTO: documentTypeName,
        DOCUMENTO_DE_IDENTIDAD: documentNumber,
        MEMBRESIA: membershipName,

        CELULAR: phone,

        FECHA_DE_INGRESO: startedAt,
        FECHA_DE_RETIRO: inactivatedAt,

        PUNTOS_DISPONIBLES: availablePoints,
      } = parsed.data

      const formattedJobDepartmentName = capitalize(jobDepartmentName?.trim())
      const formattedJobPositionName = capitalize(jobPositionName?.trim())

      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          employee: {
            select: {
              id: true,
              status: true,
              bankAccount: {
                select: {
                  id: true,
                  accountTypeId: true,
                  bankId: true,
                  identityDocumentId: true,
                },
              },
            },
          },
        },
      })

      try {
        const country = countryName
          ? await prisma.country.findFirst({
              where: {
                name: {
                  contains: countryName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        const membership = membershipName
          ? await prisma.membership.findFirst({
              where: {
                name: {
                  contains: membershipName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (countryName && !country) {
          errorResponses[itemIndex].push(`País ${countryName} no encontrado`)
        }

        const connectCurrencyDefault: Prisma.EmployeeCreateInput['currency'] = {
          connectOrCreate: {
            where: {
              code: 'COP',
            },
            create: {
              code: 'COP',
              name: 'Peso Colombiano',
            },
          },
        }

        const bank = bankName
          ? await prisma.bank.findFirst({
              where: {
                name: {
                  contains: bankName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (bankName && !bank) {
          errorResponses[itemIndex].push(`Banco ${bankName} no encontrado`)
        }

        const accountType = accountTypeName
          ? await prisma.bankAccountType.findFirst({
              where: {
                name: {
                  contains: accountTypeName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (accountTypeName && !accountType) {
          errorResponses[itemIndex].push(
            `Tipo de cuenta ${accountTypeName} no encontrado`
          )
        }

        const documentType = documentTypeName
          ? await prisma.identityDocumentType.findFirst({
              where: {
                name: {
                  contains: documentTypeName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (documentTypeName && !documentType) {
          errorResponses[itemIndex].push(
            `Tipo de documento ${documentTypeName} no encontrado`
          )
        }

        const bankAccountFields = [
          bank,
          accountType,
          accountNumber,
          documentType,
          documentNumber,
        ]
        const bankAccountHasOneValue = bankAccountFields.some(Boolean)
        const bankAccountHasAllValues = bankAccountFields.every(Boolean)

        if (bankAccountHasOneValue !== bankAccountHasAllValues) {
          errorResponses[itemIndex].push(
            'La información de la cuenta bancaria se encuentra incompleta'
          )
        }

        const createBankAccount: Prisma.BankAccountCreateInput | undefined =
          bankAccountHasAllValues
            ? {
                accountNumber: accountNumber as string,
                bank: connect(bank?.id as number),

                accountType: connect(accountType?.id as number),

                identityDocument: {
                  create: {
                    value: documentNumber as string,
                    documentType: connect(documentType?.id as number),
                  },
                },
              }
            : undefined

        const updateBankAccount: Prisma.BankAccountUpdateInput | undefined =
          bankAccountHasAllValues
            ? {
                accountNumber: accountNumber as string,
                bank: connect(bank?.id),

                accountType: connect(accountType?.id),

                identityDocument: {
                  upsert: {
                    create: {
                      value: documentNumber as string,
                      documentType: connect(documentType?.id as number),
                    },
                    update: {
                      value: documentNumber as string,
                      documentType: connect(documentType?.id as number),
                    },
                  },
                },
              }
            : undefined

        if (errorResponses[itemIndex].length > 0) {
          return usersWithErrors.push({
            ...item,
            ERRORES: errorResponses[itemIndex].join('\n'),
          })
        }

        const newUser = await generateCreateUserInput({
          firstName,
          lastName,
          email,
        })

        const employee = await prisma.employee.upsert({
          where: {
            id: existingUser?.employee?.id || '',
          },
          include: {
            user: true,
          },
          create: {
            user: {
              create: {
                ...newUser,
              },
            },
            availablePoints: availablePoints
              ? parseFloat(availablePoints)
              : undefined,
            startedAt: startedAt ? sanitizeDate(new Date(startedAt)) : null,
            inactivatedAt: inactivatedAt
              ? sanitizeDate(new Date(inactivatedAt))
              : null,
            salaryFiat: parseFloat(salary),
            advanceAvailableAmount: parseFloat(availableAmount),
            advanceMaxAmount: parseFloat(maxAvailableAmount),
            roles: [EmployeeRole.MEMBER],
            phone,

            status:
              status?.toLowerCase() == EmployeeStatus.ACTIVE.toLowerCase() ||
              status?.toLowerCase() == 'activo'
                ? EmployeeStatus.ACTIVE
                : EmployeeStatus.INACTIVE,

            company: connect(company?.id),

            jobDepartment: formattedJobDepartmentName
              ? {
                  connect: {
                    name: formattedJobDepartmentName,
                  },
                }
              : undefined,

            jobPosition: formattedJobPositionName
              ? {
                  connect: {
                    name: formattedJobPositionName,
                  },
                }
              : undefined,

            country: connect(country?.id),
            membership: connect(membership?.id),
            currency: connectCurrencyDefault,
            bankAccount: { create: createBankAccount },
          },
          update: {
            user: {
              update: {
                ...newUser,
              },
            },
            availablePoints: availablePoints
              ? parseFloat(availablePoints)
              : undefined,

            startedAt: startedAt ? sanitizeDate(new Date(startedAt)) : null,
            salaryFiat: parseFloat(salary),
            advanceAvailableAmount: parseFloat(availableAmount),
            advanceMaxAmount: parseFloat(maxAvailableAmount),
            roles: [EmployeeRole.MEMBER],
            phone,

            /** If we have an "inactivatedAt" value,
             *  we will use it.
             *  If not, we will check the status update
             *  and check if we should update the field or
             *  delete the current value.
             */
            inactivatedAt: inactivatedAt
              ? sanitizeDate(new Date(inactivatedAt))
              : existingUser?.employee?.status === EmployeeStatus.ACTIVE &&
                status?.toLowerCase() == 'inactivo'
              ? sanitizeDate(new Date())
              : null,

            status:
              status?.toLowerCase() == EmployeeStatus.ACTIVE.toLowerCase() ||
              status?.toLowerCase() == 'activo'
                ? EmployeeStatus.ACTIVE
                : EmployeeStatus.INACTIVE,

            company: connect(company.id),

            jobDepartment: formattedJobDepartmentName
              ? {
                  connectOrCreate: {
                    where: {
                      name: formattedJobDepartmentName,
                    },
                    create: {
                      name: formattedJobDepartmentName,
                    },
                  },
                }
              : undefined,

            jobPosition: formattedJobPositionName?.trim()
              ? {
                  connectOrCreate: {
                    where: {
                      name: formattedJobPositionName,
                    },
                    create: {
                      name: formattedJobPositionName,
                    },
                  },
                }
              : undefined,

            country: connectOrDisconnect(country?.id),
            membership: connectOrDisconnect(membership?.id),
            currency: connectCurrencyDefault,

            bankAccount: createBankAccount &&
              updateBankAccount && {
                upsert: {
                  create: createBankAccount,
                  update: updateBankAccount,
                },
              },
          },
        })

        if (process.env.NODE_ENV === 'production' && !existingUser) {
          sendInvitation({
            firstName,
            destination: email,
            token: newUser.loginToken,
          })
        }

        if (!existingUser) {
          createdUsersCount++
        } else {
          updatedUsersCount++
        }

        return employee
      } catch (e) {
        // todo: Add Logger
        console.error(e)
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          errorResponses[itemIndex].push(`El correo ya está en uso`)
        } else if (e instanceof Error) {
          errorResponses[itemIndex].push(
            `Error inesperado, favor contactar al equipo de desarrollo: ${e?.message}`
          )
        }

        return usersWithErrors.push({
          ...item,
          ERRORES: errorResponses[itemIndex].join('\n'),
        })
      }
    }
  })

  await Promise.all(promises)

  return { createdUsersCount, updatedUsersCount, usersWithErrors }
}

export const deleteEmployeeById = async (employeeId: Employee['id']) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  })

  if (!employee) {
    throw new Response('No se ha encontrado el ID del empleado', {
      status: 404,
    })
  }

  // By having "onDelete: Cascade" in the prisma schema,
  // we will delete the employee when we delete the user
  try {
    await prisma.user.delete({
      where: {
        id: employee.userId,
      },
      select: {
        id: true,
        employee: {
          select: {
            id: true,
          },
        },
      },
    })

    return true
  } catch (err) {
    throw new Response('Ha ocurrido un error al eliminar el empleado', {
      status: 404,
    })
  }
}

interface GetEmployeePaymentOptionsArgs {
  employee: Pick<
    Employee,
    'advanceCryptoAvailableAmount' | 'advanceAvailableAmount'
  >
  wallet?: Pick<Wallet, 'address'> | null
  bankAccount?:
    | (Pick<BankAccount, 'accountNumber'> & {
        bank: Pick<Bank, 'name'>
      })
    | null
}

export const getEmployeePaymentOptions = ({
  employee,
  wallet,
  bankAccount,
}: GetEmployeePaymentOptionsArgs) => {
  const paymentOptions = []

  if (
    wallet &&
    employee.advanceCryptoAvailableAmount &&
    employee.advanceCryptoAvailableAmount > 0
  ) {
    paymentOptions.push({
      value: PayrollAdvancePaymentMethod.WALLET,
      name: `Billetera cripto — ${wallet.address}`,
    })
  }

  if (bankAccount && employee.advanceAvailableAmount > 0) {
    paymentOptions.push({
      value: PayrollAdvancePaymentMethod.BANK_ACCOUNT,
      name: `${bankAccount?.bank.name} — ${bankAccount.accountNumber}`,
    })
  }

  return paymentOptions
}

const generateCreateUserInput = async (user: Prisma.UserCreateInput) => {
  const loginExpiration = generateExpirationDate(INVITATION_EXPIRES_IN)
  const loginToken = await generateRandomToken()

  const newUser = {
    ...user,
    email: user.email.toLowerCase(),
    loginExpiration,
    loginToken,
  }

  return newUser
}
