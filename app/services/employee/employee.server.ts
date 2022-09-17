import type {
  Bank,
  BankAccount,
  Company,
  Employee,
  Prisma,
  Wallet,
} from '@prisma/client'
import { PayrollAdvancePaymentMethod } from '@prisma/client'
import type { EmployeeSchemaInput } from './employee.schema'

import { EmployeeStatus } from '@prisma/client'
import { Response, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { connect, connectOrDisconnect } from '~/utils/relationships'
import { generateExpirationDate, generateRandomToken } from '../auth.server'
import { sendInvitation } from '../email/email.server'
import { badRequest } from 'remix-utils'
import { dateAsUTC } from '~/utils/formatDate'
import type { WelcomeSchemaInput } from '~/schemas/welcome.schema'
import { hash } from 'bcryptjs'
import { requestSignature } from '../signature/signature.server'

const INVITATION_EXPIRES_IN = '20m'

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
      company: true,
      cryptocurrency: true,
      wallet: {
        include: {
          network: true,
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
        },
      },
    },
  })
}

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
    throw json({ error: 'La compañía no ha sido encontrada', status: 404 })
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
  } = data

  const userExists = await prisma.user.findUnique({
    where: { email: user.email },
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
            bank: {
              connect: {
                id: bankAccount.bankId,
              },
            },

            accountType: {
              connect: {
                id: bankAccount.accountTypeId,
              },
            },

            identityDocument: {
              create: {
                value: bankAccount.identityDocument.value,
                documentType: {
                  connect: {
                    id:
                      bankAccount.identityDocument.documentTypeId || undefined,
                  },
                },
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
            network: {
              connect: {
                id: wallet.cryptoNetworkId,
              },
            },
          },
        }
      : undefined

  try {
    const loginExpiration = generateExpirationDate(INVITATION_EXPIRES_IN)
    const loginToken = await generateRandomToken()

    const newUser: Prisma.UserCreateInput = {
      ...user,
      loginExpiration,
      loginToken,
    }

    const employee = await prisma.employee.create({
      data: {
        salaryFiat,
        salaryCrypto,
        advanceAvailableAmount,
        advanceCryptoAvailableAmount,
        advanceCryptoMaxAmount,
        advanceMaxAmount,
        address,
        phone,
        numberOfChildren: numberOfChildren || undefined,
        roles: roles || undefined,

        birthDay: dateAsUTC(birthDay),
        documentIssueDate: dateAsUTC(documentIssueDate),

        gender: connect(genderId),
        country: connect(countryId),
        state: connect(stateId),
        city: connect(cityId),

        user: {
          create: {
            ...newUser,
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
    return { error: err, employee: null }
  }
}

export const updateEmployeeById = async (
  data: EmployeeSchemaInput,
  employeeId: Employee['id']
) => {
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

    user,
    bankAccount,
    wallet,
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
          delete: true,
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
                  documentType: {
                    connect: {
                      id: bankAccount.identityDocument?.documentTypeId,
                    },
                  },
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
                  documentType: {
                    connect: {
                      id: bankAccount.identityDocument?.documentTypeId,
                    },
                  },
                },
              },
            },
          },
        }
      : {
          delete: true,
        }

  try {
    return await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        salaryFiat,
        salaryCrypto,
        advanceAvailableAmount,
        advanceCryptoAvailableAmount,
        advanceCryptoMaxAmount,
        advanceMaxAmount,
        birthDay: dateAsUTC(birthDay),
        documentIssueDate: dateAsUTC(documentIssueDate),
        address,
        phone,
        status,
        numberOfChildren: numberOfChildren || undefined,
        roles: roles || undefined,

        gender: connectOrDisconnect(genderId),
        country: connectOrDisconnect(countryId),
        state: connectOrDisconnect(stateId),
        city: connectOrDisconnect(cityId),
        jobDepartment: connectOrDisconnect(jobDepartmentId),
        jobPosition: connectOrDisconnect(jobPositionId),
        currency: connectOrDisconnect(currencyId),
        cryptocurrency: connectOrDisconnect(cryptocurrencyId),

        bankAccount: upsertBankAccount,
        wallet: upsertWallet,

        user: {
          update: {
            ...user,
          },
        },
      },
    })
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({ message: 'Ha ocurrido un error' })
  }
}

export const updateEmployeeByWelcomeForm = async (
  data: WelcomeSchemaInput,
  employeeId: Employee['id']
) => {
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
        birthDay: dateAsUTC(birthDay),
        documentIssueDate: dateAsUTC(documentIssueDate),
        address,
        phone,
        numberOfChildren: numberOfChildren || undefined,

        gender: connectOrDisconnect(genderId),
        country: connectOrDisconnect(countryId),
        state: connectOrDisconnect(stateId),
        city: connectOrDisconnect(cityId),

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

    const { signerToken } = await requestSignature({
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      employeeId,
      phone,
    })

    return signerToken as string
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    throw badRequest({ message: 'Ha ocurrido un error' })
  }
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
