import { EmployeeStatus } from '@prisma/client'
import clsx from 'clsx'

interface EmployeeStatusPillProps {
  employeeStatus: EmployeeStatus
}

const employeeStatusLabel = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
} as const

export const EmployeeStatusPill = ({
  employeeStatus,
}: EmployeeStatusPillProps) => {
  return (
    <span
      className={clsx(
        'inline-flex min-w-[6rem] justify-center rounded-3xl px-4 py-1 text-xs font-semibold leading-5',
        employeeStatus === EmployeeStatus.ACTIVE
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      )}
    >
      {employeeStatusLabel[employeeStatus]}
    </span>
  )
}
