import type {
  Prisma,
  Company,
  Employee,
  PayrollAdvance,
  User,
  AdminUser,
  PayrollAdvanceRequestReason,
} from '@prisma/client'
import type { CalculatePayrollSchemaInput } from '~/schemas/calculate-payroll.schema'
import type { ITaxItem } from './payroll-advance.interface'

import {
  CompanyStatus,
  EmployeeStatus,
  PayrollAdvanceHistoryActor,
  PayrollAdvancePaymentMethod,
  PayrollAdvanceStatus,
} from '@prisma/client'
import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { upsertFiatMonthlyDebt } from '~/services/company-debt/company-debt.server'
import {
  sendPayrollNotificationToAdmin,
  sendPayrollNotificationToUser,
} from '../email/email.server'
// import { sendSMS } from '../sms/sms.service'

export type TPayrollContent = {
  [key in PayrollAdvanceStatus]?: {
    [key in PayrollAdvancePaymentMethod]: number
  }
}

const BINANCE_USD_NAME = 'Binance USD' as const

type TPaydayContent = {
  quantity: number
} & TPayrollContent

type TPaydaysDictionary = {
  [key in string]: TPaydayContent
}

type TPaydaysArray = ({
  dayNumber: number
} & TPaydayContent)[]

export const getMonthlyOverview = async (dateString: string) => {
  const [month, year] = dateString.split('-').map((x) => parseInt(x, 10))

  // If we are in December (index 11), next month should be January (index 0)
  const nextMonth = month === 11 ? 0 : month + 1

  // If nextMonth is January (index 0), nextYear should be year plus 1
  const nextYear = nextMonth === 0 ? year + 1 : year

  const payrollAdvances = await prisma.payrollAdvance.findMany({
    where: {
      AND: [
        {
          company: {
            status: CompanyStatus.ACTIVE,
          },
        },
        {
          createdAt: {
            gte: new Date(year, month, 1),
            lt: new Date(nextYear, nextMonth, 1),
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      createdAt: true,
      paymentMethod: true,
      status: true,
      totalAmount: true,
      _count: true,
    },
  })

  const requestDays: TPaydaysDictionary = {}

  const overview = {
    [PayrollAdvanceStatus.REQUESTED]: 0,
    [PayrollAdvanceStatus.APPROVED]: 0,
    [PayrollAdvanceStatus.PAID]: 0,
    [PayrollAdvanceStatus.CANCELLED]: 0,
    [PayrollAdvanceStatus.DENIED]: 0,
    totalRequested: {
      [PayrollAdvancePaymentMethod.BANK_ACCOUNT]: 0,
      [PayrollAdvancePaymentMethod.WALLET]: 0,
    },
    totalPaid: {
      [PayrollAdvancePaymentMethod.BANK_ACCOUNT]: 0,
      [PayrollAdvancePaymentMethod.WALLET]: 0,
    },
  }

  payrollAdvances.forEach(
    ({ createdAt, status, paymentMethod, totalAmount }) => {
      const payrollRequestTimestamp = new Date(
        createdAt.getUTCFullYear(),
        createdAt.getUTCMonth(),
        createdAt.getUTCDate(),
        0
      ).getTime()

      overview[status]++

      overview.totalRequested[paymentMethod] = parseFloat(
        (overview.totalRequested[paymentMethod] + totalAmount).toFixed(2)
      )

      if (status === PayrollAdvanceStatus.PAID) {
        overview.totalPaid[paymentMethod] = parseFloat(
          (overview.totalPaid[paymentMethod] + totalAmount).toFixed(2)
        )
      }

      if (requestDays[payrollRequestTimestamp]) {
        requestDays[payrollRequestTimestamp].quantity++

        requestDays[payrollRequestTimestamp] = {
          ...requestDays[payrollRequestTimestamp],
          [status]: {
            ...requestDays[payrollRequestTimestamp]?.[status],
            [paymentMethod]:
              (requestDays[payrollRequestTimestamp]?.[status]?.[
                paymentMethod
              ] || 0) + totalAmount,
          },
        }
      } else {
        requestDays[payrollRequestTimestamp] = {
          quantity: 1,
          [status]: {
            [paymentMethod]: totalAmount,
          },
        }
      }
    }
  )

  const result: TPaydaysArray = []
  Object.keys(requestDays).forEach((key) => {
    if (!isNaN(parseFloat(key))) {
      result.push({
        ...requestDays[key],
        dayNumber: parseFloat(key),
      })
    }
  })

  return { overview, requestDays: result }
}

export const getPayrollAdvances = async (args?: {
  where?: Prisma.PayrollAdvanceFindManyArgs['where']
}) => {
  const { where } = args || {}
  return prisma.payrollAdvance.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
      requestedAmount: true,
      paymentMethod: true,
      totalAmount: true,
      status: true,
      employee: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      company: {
        select: {
          name: true,
        },
      },
    },
  })
}

export const getPayrollAdvanceById = async (
  payrollAdvanceId: PayrollAdvance['id']
) => {
  return prisma.payrollAdvance.findUnique({
    where: { id: payrollAdvanceId },
    include: {
      transfers: true,
      bankAccountData: true,
      walletData: true,
      requestReason: {
        select: { name: true },
      },
      employee: {
        select: {
          id: true,
          currencyId: true,
          advanceAvailableAmount: true,
          advanceCryptoAvailableAmount: true,
          advanceCryptoMaxAmount: true,
          advanceMaxAmount: true,
          phone: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
      company: true,
      taxes: true,
      history: {
        include: {
          employee: true,
        },
      },
    },
  })
}

export const getPayrollAdvanceRequestReasons = async () => {
  return prisma.payrollAdvanceRequestReason.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

interface ICalculatePayrollAdvanceArgs {
  employee: Pick<
    Employee,
    | 'advanceAvailableAmount'
    | 'advanceCryptoAvailableAmount'
    | 'status'
    | 'bankAccountId'
    | 'walletId'
  > & {
    company: Pick<
      Company,
      'lastRequestDay' | 'status' | 'paymentDays' | 'dispersion'
    >
  }
  requestedAmount: number
  paymentMethod: PayrollAdvancePaymentMethod
  requestReasonId: PayrollAdvanceRequestReason['id']
  requestReasonDescription: PayrollAdvance['requestReasonDescription']
}

export const calculatePayrollAdvance = async ({
  employee,
  requestedAmount,
  paymentMethod,
  requestReasonId,
  requestReasonDescription,
}: ICalculatePayrollAdvanceArgs) => {
  const { fieldErrors } =
    (await verifyIfEmployeeCanRequestPayroll({
      employee,
      company: employee.company,
      paymentMethod,
      requestedAmount,
    })) || {}

  if (fieldErrors) {
    return { fieldErrors }
  }

  if (paymentMethod === PayrollAdvancePaymentMethod.BANK_ACCOUNT) {
    /** Calculate the Payroll using a Fiat Currency */

    const payrollCost = await calculatePayrollCost({
      requestedAmount,
      company: employee.company,
    })

    return {
      data: {
        ...payrollCost,
        paymentMethod: PayrollAdvancePaymentMethod.BANK_ACCOUNT,
        bankAccountId: employee.bankAccountId,
        requestReasonId,
        requestReasonDescription,
      },
      fieldErrors: null,
    }
  }

  if (paymentMethod === PayrollAdvancePaymentMethod.WALLET) {
    /** Calculate the Payroll using a Crypto Currency */

    const payrollCost = await calculatePayrollCost({
      requestedAmount,
      company: employee.company,
    })

    // todo Javier: include external calculation of the crypto fee when we implement the crypto payments
    return {
      data: {
        ...payrollCost,
        paymentMethod: PayrollAdvancePaymentMethod.WALLET,
        walletId: employee.walletId,
        requestReasonId,
        requestReasonDescription,
      },
      fieldErrors: null,
    }
  }

  throw badRequest(
    'Ha ocurrido un error inesperado durante el cálculo del adelanto de nómina. Por favor contacta a un administrador.'
  )
}

type VerifyIfEmployeeCanRequestPayroll = {
  employee: Pick<
    Employee,
    'status' | 'advanceAvailableAmount' | 'advanceCryptoAvailableAmount'
  >
  company: Pick<Company, 'lastRequestDay' | 'status' | 'paymentDays'>
  paymentMethod: PayrollAdvancePaymentMethod
  requestedAmount: number
}

/** This function is used to verify, step by step, if the employee can request a new payroll advance.
 *  We have to check multiple conditions:
 *
 *  1. Check if user account is active
 *  2. Check if company account is active
 *  3. Check the day of the month
 *  4. Check if the requestedAmount is inside the availableAmount according to the paymentMethod (Wallet | BankAccount)
 */
const verifyIfEmployeeCanRequestPayroll = async ({
  employee,
  company,
  paymentMethod,
  requestedAmount,
}: VerifyIfEmployeeCanRequestPayroll) => {
  // 1. Check if user account is active
  if (employee.status === EmployeeStatus.INACTIVE) {
    throw badRequest(
      'No puedes solicitar adelantos de nómina porque tu cuenta se encuentra inactiva'
    )
  }

  // 2. Check if company account is active
  if (company.status === CompanyStatus.INACTIVE) {
    throw badRequest(
      'No puedes solicitar adelantos de nómina porque la compañía a la que perteneces se encuentra inactiva.'
    )
  }

  // 3. Check the day of the month
  const { paymentDays = [], lastRequestDay = null } = company
  const { daysWithoutRequestsBeforePaymentDay = 0 } =
    (await prisma.globalSettings.findFirst()) || {}

  const currentDate = new Date()
  const sortedPaymentDays = paymentDays.sort((a, b) => a - b)
  const lastPaymentDay = sortedPaymentDays[paymentDays.length - 1]

  const limitDate =
    currentDate.getUTCDate() + daysWithoutRequestsBeforePaymentDay

  if (
    (lastPaymentDay && limitDate >= lastPaymentDay) ||
    (lastRequestDay && currentDate.getUTCDate() > lastRequestDay)
  ) {
    throw badRequest(
      `No puedes solicitar adelantos de nómina en este momento porque la fecha de pago de nóminas se encuentra muy cerca.`
    )
  }

  //  4. Check if the requestedAmount is inside the availableAmount according to the paymentMethod (Wallet | BankAccount)
  if (paymentMethod === PayrollAdvancePaymentMethod.WALLET) {
    if (!employee.advanceCryptoAvailableAmount) {
      throw badRequest(
        'No posees cupo disponible para solicitar adelantos de criptomonedas'
      )
    }

    if (requestedAmount > employee.advanceCryptoAvailableAmount) {
      return {
        fieldErrors: {
          requestedAmount: 'El monto solicitado supera el cupo disponible',
        },
      }
    }
  } else if (paymentMethod === PayrollAdvancePaymentMethod.BANK_ACCOUNT) {
    if (!employee.advanceAvailableAmount) {
      throw badRequest('No posees cupo disponible para solicitar adelantos')
    }

    if (requestedAmount > employee.advanceAvailableAmount) {
      return {
        fieldErrors: {
          requestedAmount: 'El monto solicitado supera el cupo disponible',
        },
      }
    }
  }
}

/** Here we start the calculation for the totalAmount charged on the Payroll:
 *
 * 1. Create a "totalAmount" variable that we will update with the corresponding tax/comission amounts
 *
 * 2. Apply the extra costs if/when they apply.
 *
 * Before calling this function, we should assert that the user can request a payroll (check the verifyIfEmployeeCanRequestPayroll function for reference)
 */
const calculatePayrollCost = async ({
  requestedAmount,
  company,
}: {
  requestedAmount: number
  company: Pick<Company, 'dispersion' | 'paymentDays'>
}) => {
  requestedAmount =
    typeof requestedAmount === 'string'
      ? parseFloat(requestedAmount)
      : requestedAmount

  let totalAmount = requestedAmount

  const { dispersion = 0, paymentDays = [] } = company
  const { annualInterestRate = 0 } =
    (await prisma.globalSettings.findFirst()) || {}

  const taxItems: ITaxItem[] = []
  let periodOfDays: number | null = null

  if (annualInterestRate) {
    const currentDate = new Date()

    // If the "paymentDays" variable is empty, then we will use the last day of the month as a base number for the lastPaymentDay.
    const lastPaymentDay =
      paymentDays.length === 0
        ? new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getUTCDate()
        : paymentDays.sort((a, b) => a - b)[paymentDays.length - 1]

    periodOfDays = lastPaymentDay - currentDate.getUTCDate()

    const totalInterestBasedOnDays = Math.round(
      +requestedAmount *
        (Math.pow(annualInterestRate / 100 + 1, periodOfDays / 365) - 1)
    )

    totalAmount += totalInterestBasedOnDays

    const dateString = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`

    taxItems.push({
      name: 'Tasa de Interés (E.A)',
      description: `Tasa calculada el ${dateString}, a ${annualInterestRate}%, considerando un plazo de ${periodOfDays} días`,
      value: totalInterestBasedOnDays,
    })
  }

  if (dispersion) {
    const dispersionFee = (requestedAmount * 4) / 1000 + dispersion
    taxItems.push({
      name: 'GMF y dispersión',
      description: `Dispersión calculada utilizando ${dispersion} como base`,
      value: dispersionFee,
    })
    totalAmount += dispersionFee
  }

  totalAmount = Math.round(totalAmount)

  return { taxItems, totalAmount, requestedAmount, periodOfDays }
}

export const createPayrollAdvance = async ({
  data,
  companyId,
  employeeId,
}: {
  data: CalculatePayrollSchemaInput
  companyId: Company['id']
  employeeId: Employee['id']
}) => {
  const {
    requestedAmount,
    paymentMethod,
    requestReasonId,
    requestReasonDescription,
  } = data

  const isWalletThePaymentMethod =
    paymentMethod === PayrollAdvancePaymentMethod.WALLET

  const isBankAccountThePaymentMethod =
    paymentMethod === PayrollAdvancePaymentMethod.BANK_ACCOUNT

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      employees: {
        where: {
          id: employeeId,
        },
        include: {
          user: true,
          wallet: {
            include: {
              cryptocurrency: true,
              network: true,
            },
          },
          bankAccount: {
            include: {
              identityDocument: {
                include: {
                  documentType: true,
                },
              },
              accountType: true,
              bank: {
                include: {
                  fee: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!company) {
    throw badRequest('Compañía no encontrada')
  }

  const employee = company.employees[0]

  if (!employee || employee?.id !== employeeId) {
    // Employee ID Not Found
    throw badRequest('Colaborador no encontrado')
  }

  const { fieldErrors } =
    (await verifyIfEmployeeCanRequestPayroll({
      employee,
      company,
      paymentMethod,
      requestedAmount,
    })) || {}

  if (fieldErrors) {
    return { fieldErrors }
  }

  const { bankAccount, wallet } = employee

  if (isBankAccountThePaymentMethod && !bankAccount) {
    // The employee must create a bank account first!
    throw badRequest('No hemos encontrado una cuenta bancaria registrada')
  }

  if (isWalletThePaymentMethod && (!wallet || !wallet?.network)) {
    // The employee must create a wallet first!
    throw badRequest('No se recibió información de la billetera cripto')
  }

  // Right now only working with Binance USD
  const selectedCryptocurrency = await prisma.cryptocurrency.findFirst({
    where: {
      name: {
        equals: BINANCE_USD_NAME,
      },
    },
  })

  const connectWalletData: Prisma.PayrollAdvanceCreateInput['walletData'] =
    isWalletThePaymentMethod &&
    selectedCryptocurrency &&
    wallet?.network &&
    wallet?.address
      ? {
          create: {
            address: wallet?.address,
            cryptocurrencyName: selectedCryptocurrency.name,
            cryptocurrencyAcronym: selectedCryptocurrency.acronym,
            cryptoNetworkName: wallet?.network.name,
            cryptoNetworkIdNumber: wallet?.network.networkIdNumber,
          },
        }
      : {}

  const selectedCurrency = await prisma.currency.findUnique({
    where: {
      code: 'COP',
    },
  })

  const createBankAccountData: Prisma.PayrollAdvanceCreateInput['bankAccountData'] =
    isBankAccountThePaymentMethod && bankAccount
      ? {
          create: {
            accountNumber: bankAccount.accountNumber,
            accountType: bankAccount.accountType.name,
            currencyName: selectedCurrency?.name || 'Pesos colombianos', // TODO Javier: make this dynamic
            bankName: bankAccount.bank.name,
            bankFeeName: null,
            bankFeeValue: bankAccount?.bank?.fee?.value || null,
            bankFeeValueType: bankAccount.bank?.fee?.valueType || null,
            identityDocumentValue: bankAccount.identityDocument.value,
            identityDocumentType:
              bankAccount.identityDocument.documentType.name,
          },
        }
      : undefined

  const {
    taxItems,
    totalAmount,
    periodOfDays = null,
  } = await calculatePayrollCost({
    requestedAmount,
    company,
  })

  const createManyTaxes: Prisma.PayrollAdvanceCreateInput['taxes'] =
    taxItems.length
      ? {
          createMany: { data: taxItems },
        }
      : {}

  const createHistory: Prisma.PayrollAdvanceCreateInput['history'] = {
    create: {
      toStatus: PayrollAdvanceStatus.REQUESTED,
      actor: PayrollAdvanceHistoryActor.EMPLOYEE,
      employee: {
        connect: {
          id: employeeId,
        },
      },
    },
  }

  await verifyIfEmployeeCanRequestPayroll({
    employee,
    company,
    paymentMethod,
    requestedAmount,
  })

  const payroll = await prisma.payrollAdvance.create({
    data: {
      requestedAmount,
      totalAmount,
      periodOfDays,
      status: PayrollAdvanceStatus.REQUESTED,
      paymentMethod,
      company: connect(companyId),
      employee: connect(employeeId),
      walletData: connectWalletData,
      bankAccountData: createBankAccountData,
      requestReason: connect(requestReasonId),
      requestReasonDescription,

      taxes: createManyTaxes,
      history: createHistory,
    },
  })

  const { firstName, lastName } = employee.user

  sendPayrollNotificationToAdmin({
    payrollId: payroll.id,
    status: PayrollAdvanceStatus.REQUESTED,
    employeeFullName: `${firstName} ${lastName}`,
  })

  const newFiatAvailableAmount = isBankAccountThePaymentMethod
    ? Math.max(employee.advanceAvailableAmount - requestedAmount, 0)
    : 0

  const newCryptoAvailableAmount = isWalletThePaymentMethod
    ? Math.max(
        // We can use assertion here because we will throw an error with "verifyIfEmployeeCanRequestPayroll" in case the employee doesnt have advanceCryptoAvailableAmount
        (employee.advanceCryptoAvailableAmount as number) - requestedAmount,
        0
      )
    : 0

  await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      advanceAvailableAmount: newFiatAvailableAmount,
      advanceCryptoAvailableAmount: newCryptoAvailableAmount,
    },
  })

  return payroll
}

const { CANCELLED, DENIED, APPROVED, PAID } = PayrollAdvanceStatus
const { BANK_ACCOUNT, WALLET } = PayrollAdvancePaymentMethod
export const updatePayrollAdvanceStatus = async ({
  employee,
  user,
  adminUser,
  payrollAdvance,
  toStatus,
  actor,
}: {
  employee: Pick<
    Employee,
    | 'id'
    | 'advanceAvailableAmount'
    | 'advanceMaxAmount'
    | 'advanceCryptoAvailableAmount'
    | 'advanceCryptoMaxAmount'
    | 'currencyId'
    | 'phone'
  >
  adminUser?: Pick<AdminUser, 'id'>
  user: Pick<User, 'firstName' | 'lastName' | 'email'>
  payrollAdvance: Pick<
    PayrollAdvance,
    | 'id'
    | 'requestedAmount'
    | 'paymentMethod'
    | 'status'
    | 'companyId'
    | 'totalAmount'
  >
  toStatus: PayrollAdvanceStatus
  actor: PayrollAdvanceHistoryActor
}) => {
  if (payrollAdvance.status === toStatus) {
    throw badRequest('El adelanto de nómina ya se encuentra actualizado')
  }

  if (payrollAdvance.status === PAID) {
    throw badRequest(
      'El adelanto de nómina ya fue pagado, no puede actualizarse'
    )
  }

  /** We only need to update the employee if we will NOT procceed with the Payroll Advance.
   *  Here we update will the employee available amount.
   */
  const updateEmployee =
    toStatus === CANCELLED || toStatus === DENIED
      ? updateEmployeeOnCanceledPayrollInput({
          employee,
          requestedAmount: payrollAdvance.requestedAmount,
          paymentMethod: payrollAdvance.paymentMethod,
        })
      : undefined

  const createHistory: Prisma.PayrollAdvanceUpdateInput['history'] = {
    create: {
      actor,
      toStatus,

      employee:
        actor === PayrollAdvanceHistoryActor.EMPLOYEE
          ? connect(employee.id)
          : undefined,

      adminUser:
        actor === PayrollAdvanceHistoryActor.ADMIN
          ? connect(adminUser?.id)
          : undefined,
    },
  }

  try {
    const updatedPayroll = await prisma.payrollAdvance.update({
      where: {
        id: payrollAdvance.id,
      },
      data: {
        status: toStatus,
        employee: updateEmployee,
        history: createHistory,
      },
    })

    switch (toStatus) {
      case DENIED: {
        sendPayrollNotificationToUser({
          destination: user.email,
          payrollId: payrollAdvance.id,
          status: toStatus,
        })

        // console.log('DENIED', employee.phone)

        // if (employee.phone) {
        //   console.log('will call sendSMS ~~~~~~~~~~')

        //   await sendSMS({
        //     PhoneNumber: employee.phone,
        //     Message:
        //       'Tu solicitud no pudo ser aprobada :disappointed: ¿Necesitas más información? Ingresa a https://hoyadelantas.com',
        //   })
        // }
        break
      }

      case CANCELLED: {
        sendPayrollNotificationToAdmin({
          payrollId: payrollAdvance.id,
          status: toStatus,
          employeeFullName: `${user.firstName} ${user.lastName}`,
        })
        break
      }

      case APPROVED: {
        // if (employee.phone) {
        //   await sendSMS({
        //     PhoneNumber: employee.phone,
        //     Message:
        //       '¡Tu solicitud de adelanto de nómina acaba de ser aprobada, en minutos desembolsaremos el dinero a tu cuenta!',
        //   })
        // }
        break
      }

      case PAID: {
        sendPayrollNotificationToUser({
          destination: user.email,
          payrollId: payrollAdvance.id,
          status: toStatus,
        })

        if (payrollAdvance.paymentMethod === BANK_ACCOUNT) {
          await upsertFiatMonthlyDebt({
            payrollAdvance,
            employee,
            companyId: payrollAdvance.companyId,
          })
        }

        if (payrollAdvance.paymentMethod === WALLET) {
          // to do: add Crypto payment
        }

        // if (employee.phone) {
        //   await sendSMS({
        //     PhoneNumber: employee.phone,
        //     Message:
        //       '¡Tu solicitud de adelanto ha sido desembolsada! En unas horas el dinero se verá reflejado en tu cuenta :grinning:',
        //   })
        // }
        break
      }

      default:
        break
    }

    return updatedPayroll
  } catch (e) {
    // Todo LOGGER: Log error and save to a file
    console.error(e)
    throw badRequest(
      'Ha ocurrido un error durante la actualización del adelanto de nómina'
    )
  }
}

const updateEmployeeOnCanceledPayrollInput = ({
  employee: {
    advanceAvailableAmount,
    advanceMaxAmount,
    advanceCryptoAvailableAmount,
    advanceCryptoMaxAmount,
  },
  requestedAmount,
  paymentMethod,
}: {
  employee: Pick<
    Employee,
    | 'advanceAvailableAmount'
    | 'advanceMaxAmount'
    | 'advanceCryptoAvailableAmount'
    | 'advanceCryptoMaxAmount'
  >
  requestedAmount: PayrollAdvance['requestedAmount']
  paymentMethod: PayrollAdvancePaymentMethod
}) => {
  const newFiatAvailableAmount =
    paymentMethod === PayrollAdvancePaymentMethod.BANK_ACCOUNT
      ? Math.min(advanceAvailableAmount + requestedAmount, advanceMaxAmount)
      : advanceAvailableAmount

  const newCryptoAvailableAmount =
    paymentMethod === PayrollAdvancePaymentMethod.WALLET
      ? Math.min(
          (advanceCryptoAvailableAmount || 0) + requestedAmount,
          advanceCryptoMaxAmount || 0
        )
      : advanceCryptoAvailableAmount

  const updateEmployee: Prisma.PayrollAdvanceUpdateInput['employee'] = {
    update: {
      advanceAvailableAmount: newFiatAvailableAmount,
      advanceCryptoAvailableAmount: newCryptoAvailableAmount,
    },
  }

  return updateEmployee
}
