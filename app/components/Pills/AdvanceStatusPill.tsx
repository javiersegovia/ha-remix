import type { PremiumAdvanceStatus } from '@prisma/client'
import { PayrollAdvanceStatus } from '@prisma/client'
import clsx from 'clsx'

// We can use one file for both types of advances (premium & payroll) because
// both of them have the same statuses.

// If we add or remove an status from one of them, we'll have to update this file.

interface AdvanceStatusPillProps {
  status: PayrollAdvanceStatus | PremiumAdvanceStatus
}

const advanceStatusLabel = {
  REQUESTED: 'En revisión',
  APPROVED: 'Aprobado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
  DENIED: 'Denegado',
} as const

export const AdvanceStatusPill = ({ status }: AdvanceStatusPillProps) => {
  return (
    <span
      className={clsx(
        'inline-flex min-w-[6rem] justify-center rounded-md px-4 py-1 text-xs font-semibold leading-5',
        status === PayrollAdvanceStatus.REQUESTED &&
          'bg-yellow-100 text-yellow-700',

        status === PayrollAdvanceStatus.APPROVED && 'bg-blue-200 text-blue-700',

        status === PayrollAdvanceStatus.PAID && 'bg-green-200 text-green-700',

        status === PayrollAdvanceStatus.CANCELLED &&
          'bg-orange-50 text-orange-700',

        status === PayrollAdvanceStatus.DENIED && 'bg-red-200 text-red-700'
      )}
    >
      {advanceStatusLabel[status]}
    </span>
  )
}
