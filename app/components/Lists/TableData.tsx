import type { PropsWithChildren } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface TableDataProps extends PropsWithChildren {
  isCentered?: boolean
  className?: string
}

export const TableData = ({
  children,
  isCentered = false,
  className,
}: TableDataProps) => (
  <td
    className={twMerge(
      clsx('whitespace-nowrap px-6 py-4', isCentered && 'text-center'),
      className
    )}
  >
    {children}
  </td>
)
