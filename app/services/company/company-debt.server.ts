import type { Company, Employee, PayrollAdvance, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

/** This function will return a CompanyDebt matching the month and year provided */
export const getCompanyDebtById = async (companyDebtId: string) => {
  const companyDebt = await prisma.companyDebt.findUnique({
    where: { id: companyDebtId },
    include: {
      company: true,
      fiatDebt: {
        include: {
          payrollAdvances: {
            select: {
              id: true,
              status: true,
              requestedAmount: true,
              totalAmount: true,
              paymentMethod: true,
              createdAt: true,
              company: {
                select: {
                  name: true,
                },
              },
              employee: {
                select: {
                  user: true,
                },
              },
            },
          },
        },
      },
      cryptoDebt: {
        include: {
          payrollAdvances: {
            include: {
              company: true,
              employee: {
                select: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return companyDebt
}

export const getCompanyDebtsByCompanyId = (companyId: string) => {
  return prisma.companyDebt.findMany({
    where: {
      companyId,
    },
    orderBy: [
      {
        month: 'asc',
      },
      {
        year: 'asc',
      },
    ],
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

  const companyDebt = await prisma.companyDebt.findFirst({
    where: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
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
