import type {
  City,
  Employee,
  EmployeeStatus,
  JobDepartment,
} from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'

import { Link } from '@remix-run/react'
import { $path } from 'remix-routes'
import { EmployeeStatusPill } from '~/components/Pills/EmployeeStatusPill'
import { TableSortableButton } from '~/components/UI/Table'

export type EmployeeDataItem = {
  id: Employee['id']
  fullName: string | null
  email: string | null
  availablePoints?: number
  jobDepartment?: Pick<JobDepartment, 'name'> | null
  city?: Pick<City, 'name'> | null
  status: EmployeeStatus
}

export const columns: ColumnDef<EmployeeDataItem>[] = [
  {
    id: 'fullName',
    header: ({ column }) => {
      return (
        <TableSortableButton
          title="Nombre colaborador"
          column={column}
          className="mx-0"
        />
      )
    },
    accessorKey: 'fullName',
    cell: (props) => {
      const item = props.row.original

      return (
        <>
          <Link
            preventScrollReset
            to={$path('/people/:employeeId/details', {
              employeeId: item.id,
            })}
            className="whitespace-pre-line hover:text-cyan-600"
          >
            <p>{item.fullName}</p>
            <p className="block text-gray-500">{item.email}</p>
          </Link>
        </>
      )
    },
  },
  {
    accessorKey: 'jobDepartment.name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Área" column={column} />
    },
  },
  {
    accessorKey: 'city.name',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Ciudad" column={column} />
    },
  },
  {
    accessorKey: 'availablePoints',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Puntos disponibles" column={column} />
    },
  },
  {
    accessorKey: 'status',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Estado" column={column} />
    },
    cell: (props) => (
      <EmployeeStatusPill employeeStatus={props.getValue<EmployeeStatus>()} />
    ),
  },
]
