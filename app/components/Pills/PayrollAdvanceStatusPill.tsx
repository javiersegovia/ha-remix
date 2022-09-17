import { PayrollAdvanceStatus } from '@prisma/client'
import clsx from 'clsx'

interface PayrollAdvanceStatusPillProps {
  payrollAdvanceStatus: PayrollAdvanceStatus
}

const payrollAdvanceStatusLabel = {
  REQUESTED: 'En revisión',
  APPROVED: 'Aprobado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
  DENIED: 'Denegado',
} as const

export const PayrollAdvanceStatusPill = ({
  payrollAdvanceStatus,
}: PayrollAdvanceStatusPillProps) => {
  return (
    <span
      className={clsx(
        'inline-flex min-w-[6rem] justify-center rounded-md px-4 py-1 text-xs font-semibold leading-5',
        payrollAdvanceStatus === PayrollAdvanceStatus.REQUESTED &&
          'bg-yellow-100 text-yellow-700',

        payrollAdvanceStatus === PayrollAdvanceStatus.APPROVED &&
          'bg-blue-200 text-blue-700',

        payrollAdvanceStatus === PayrollAdvanceStatus.PAID &&
          'bg-green-200 text-green-700',

        payrollAdvanceStatus === PayrollAdvanceStatus.CANCELLED &&
          'bg-orange-50 text-orange-700',

        payrollAdvanceStatus === PayrollAdvanceStatus.DENIED &&
          'bg-red-200 text-red-700'
      )}
    >
      {payrollAdvanceStatusLabel[payrollAdvanceStatus]}
    </span>
  )
}
