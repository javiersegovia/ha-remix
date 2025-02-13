import type { Company, Employee, PayrollAdvance, Prisma } from '@prisma/client'
import type { CompanyDebtSchemaInput } from './company-debt.schema'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { sanitizeDate } from '~/utils/formatDate'

/** This function will return a CompanyDebt matching the month and year provided */
export const getCompanyDebtById = async (companyDebtId: string) => {
  const companyDebt = await prisma.companyDebt.findUnique({
    where: { id: companyDebtId },
    select: {
      id: true,
      createdAt: true,
      companyId: true,
      company: {
        select: {
          name: true,
        },
      },
      fiatDebt: {
        select: {
          id: true,
          amount: true,
          currentAmount: true,
        },
      },
      cryptoDebt: {
        select: {
          id: true,
          amount: true,
          currentAmount: true,
        },
      },
    },
  })

  return companyDebt
}

export const getCompanyDebtsByCompanyId = async (
  companyId: string,
  options?: Pick<Prisma.CompanyFindManyArgs, 'take' | 'skip' | 'cursor'>
) => {
  const { take, skip } = options || {}
  return prisma.companyDebt.findMany({
    where: {
      companyId,
    },
    take,
    skip,
    orderBy: {
      createdAt: 'desc',
    },
    // todo: select only required values
    include: {
      fiatDebt: {
        include: {
          _count: {
            select: {
              payrollAdvances: true,
            },
          },
        },
      },
      cryptoDebt: {
        include: {
          _count: {
            select: {
              payrollAdvances: true,
            },
          },
        },
      },
    },
  })
}

export const upsertFiatMonthlyDebt = async ({
  payrollAdvance,
  employee,
  companyId,
}: {
  payrollAdvance: Pick<PayrollAdvance, 'id' | 'companyId' | 'totalAmount'>
  employee: Pick<Employee, 'currencyId'>
  companyId: Company['id']
}) => {
  /** Here we look for a debt in the current month that belongs to the current company,
   *  and uses the same currency of the current payroll. */

  // todo Javier: refactor this. We should get the currency from the payroll, instead of getting the employee currency!

  const createFiatDebt: Prisma.CompanyDebtCreateInput['fiatDebt'] = {
    create: {
      amount: payrollAdvance.totalAmount,
      currentAmount: payrollAdvance.totalAmount,
      currency: connect(employee.currencyId as number),
      payrollAdvances: connect(payrollAdvance.id),
      company: connect(companyId),
    },
  }
  const currentDate = new Date()
  const companyDebt = await prisma.companyDebt.findFirst({
    where: {
      month: (sanitizeDate(currentDate) as Date).getMonth() + 1,
      year: (sanitizeDate(currentDate) as Date).getFullYear(),
      companyId: payrollAdvance.companyId,
    },
    include: {
      fiatDebt: true,
    },
  })

  if (!companyDebt) {
    /** If no companyDebt is found, this should be the first payroll being marked as paid (for this company).
     *  We will create it
     */

    return prisma.companyDebt.create({
      data: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        company: connect(companyId),
        fiatDebt: createFiatDebt,
      },
    })
  }

  /** We found a companyDebt, so we should update its current value,
   *  and include this payrollAdvance in the relationship of fiatDebt.
   */
  return prisma.companyDebt.update({
    where: {
      id: companyDebt.id,
    },
    data: {
      fiatDebt: {
        upsert: {
          create: {
            amount: payrollAdvance.totalAmount,
            currentAmount: payrollAdvance.totalAmount,
            currency: connect(employee.currencyId as number),
            payrollAdvances: connect(payrollAdvance.id),
            company: connect(companyId),
          },
          update: {
            amount:
              payrollAdvance.totalAmount + (companyDebt.fiatDebt?.amount || 0),
            currentAmount:
              payrollAdvance.totalAmount +
              (companyDebt.fiatDebt?.currentAmount || 0),
            payrollAdvances: connect(payrollAdvance.id),
          },
        },
      },
    },
  })
}

export const updateCompanyDebt = async (
  companyDebtId: string,
  data: CompanyDebtSchemaInput
) => {
  const { fiatDebt, cryptoDebt } = data

  const companyDebt = await prisma.companyDebt.findUnique({
    where: { id: companyDebtId },
  })

  if (!companyDebt) {
    throw badRequest({ message: 'Novedad no encontrada', redirect: null })
  }

  if (fiatDebt && fiatDebt.currentAmount > fiatDebt.totalAmount) {
    return {
      fieldErrors: {
        'cryptoDebt.currentAmount': '',
        'fiatDebt.currentAmount':
          'El monto de novedad actual no puede ser mayor al monto total',
      },
    }
  }

  if (cryptoDebt && cryptoDebt.currentAmount > cryptoDebt.totalAmount) {
    return {
      fieldErrors: {
        'fiatDebt.currentAmount': '',
        'cryptoDebt.currentAmount':
          'El monto de novedad actual no puede ser mayor al monto total',
      },
    }
  }

  const updateCryptoDebt: Prisma.CompanyDebtUpdateInput['cryptoDebt'] =
    cryptoDebt
      ? {
          update: {
            currentAmount: cryptoDebt.currentAmount,
            amount: cryptoDebt.totalAmount,
          },
        }
      : undefined

  const updateFiatDebt: Prisma.CompanyDebtUpdateInput['fiatDebt'] = fiatDebt
    ? {
        update: {
          currentAmount: fiatDebt.currentAmount,
          amount: fiatDebt.totalAmount,
        },
      }
    : undefined

  try {
    return await prisma.companyDebt.update({
      where: { id: companyDebt.id },
      data: {
        cryptoDebt: updateCryptoDebt,
        fiatDebt: updateFiatDebt,
      },
    })
  } catch (e) {
    // TODO: Add logger
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado al actualizar la novedad',
      redirect: null,
    })
  }
}
