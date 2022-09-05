import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

interface TableDataProps extends PropsWithChildren {
  isCentered?: boolean
}

export const TableData = ({ children, isCentered = false }: TableDataProps) => (
  <td
    className={clsx('whitespace-nowrap px-6 py-4', isCentered && 'text-center')}
  >
    {children}
  </td>
)
