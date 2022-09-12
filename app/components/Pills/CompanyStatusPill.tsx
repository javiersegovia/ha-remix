import { CompanyStatus } from '@prisma/client'
import clsx from 'clsx'

interface CompanyStatusPillProps {
  companyStatus: CompanyStatus
}

const companyStatusLabel = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
} as const

export const CompanyStatusPill = ({
  companyStatus,
}: CompanyStatusPillProps) => {
  return (
    <span
      className={clsx(
        'inline-flex min-w-[6rem] justify-center rounded-md px-4 py-1 text-xs font-semibold leading-5',
        companyStatus === CompanyStatus.ACTIVE
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      )}
    >
      {companyStatusLabel[companyStatus]}
    </span>
  )
}
