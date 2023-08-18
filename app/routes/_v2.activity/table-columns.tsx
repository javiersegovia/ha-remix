import type { Employee, Indicator, IndicatorActivity } from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'

import { Link } from '@remix-run/react'
import { $path } from 'remix-routes'
import { TableSortableButton } from '~/components/UI/Table'
import { formatDate, sanitizeDate } from '~/utils/formatDate'
import { Button, ButtonColorVariants } from '~/components/Button'

export type IndicatorActivityDataItem = Pick<
  IndicatorActivity,
  'id' | 'value'
> & {
  date: string
  indicator: Pick<Indicator, 'name'>
  employee: {
    id: Employee['id']
    user: {
      email: string
      fullName: string
    }
  }
}

export const columns: ColumnDef<IndicatorActivityDataItem>[] = [
  {
    id: 'employee.user.fullName',
    header: ({ column }) => {
      return (
        <TableSortableButton
          title="Colaborador"
          column={column}
          className="mx-0"
        />
      )
    },
    accessorKey: 'employee.user.fullName',
    cell: (props) => {
      const item = props.row.original

      return (
        <>
          <Link
            preventScrollReset
            to={$path('/people/:employeeId/details', {
              employeeId: item.employee.id,
            })}
            className="whitespace-pre-line hover:text-cyan-600"
          >
            <p>{item.employee.user.fullName}</p>
            <p className="block text-gray-500">{item.employee.user.email}</p>
          </Link>
        </>
      )
    },
  },
  {
    accessorKey: 'value',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Valor" column={column} />
    },
  },
  {
    accessorKey: 'indicator.name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Indicador" column={column} />
    },
  },
  {
    accessorKey: 'date',
    sortingFn: 'datetime',
    header: ({ column }) => {
      return <TableSortableButton title="Fecha" column={column} />
    },
    cell: (props) => (
      <>
        {formatDate(
          sanitizeDate(new Date(Date.parse(props.getValue<string>()))) as Date
        )}
      </>
    ),
  },
  {
    accessorKey: 'id',
    header: '',
    cell: (props) => {
      const item = props.row.original

      return (
        <>
          <Button
            href={$path('/activity/:indicatorActivityId', {
              indicatorActivityId: item.id,
            })}
            size="XS"
            className="ml-auto w-auto"
            variant={ButtonColorVariants.SECONDARY}
          >
            Editar
          </Button>
        </>
      )
    },
  },
]
