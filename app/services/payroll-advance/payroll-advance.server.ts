import {
  CompanyStatus,
  PayrollAdvancePaymentMethod,
  PayrollAdvanceStatus,
} from '@prisma/client'
import { prisma } from '~/db.server'

export type TPayrollContent = {
  [key in PayrollAdvanceStatus]?: {
    [key in PayrollAdvancePaymentMethod]: number
  }
}

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
