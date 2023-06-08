import type { Employee, EmployeeStatus } from '@prisma/client'
import { Link } from '@remix-run/react'
import type { ColumnDef } from '@tanstack/react-table'
import { $path } from 'remix-routes'
import { EmployeeStatusPill } from '~/components/Pills/EmployeeStatusPill'
import { TableSortableButton } from '~/components/UI/Table'
import { ControlledCheckbox } from '~/components/FormFields/ControlledCheckbox'
import { deleteFormId } from './table-actions'

export type EmployeeDataItem = {
  id: Employee['id']
  email: string
  fullName?: string
  jobDepartment?: string | null
  gender?: string | null
  age?: number | null
  salary?: string | null
  status: EmployeeStatus
}

export const columns: ColumnDef<EmployeeDataItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <ControlledCheckbox
        name="select-all"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
        formId={deleteFormId}
      />
    ),
    cell: ({ row }) => (
      <ControlledCheckbox
        name="employeesIds"
        value={row.original.id}
        checked={row.getIsSelected()}
        onChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        formId={deleteFormId}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'fullName',
    header: ({ column }) => {
      return <TableSortableButton title="Nombre colaborador" column={column} />
    },
    accessorKey: 'fullName',
    cell: (props) => {
      const item = props.row.original

      return (
        <>
          <Link
            to={$path('/dashboard/manage/employees/:employeeId/account', {
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
    accessorKey: 'jobDepartment',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Área" column={column} />
    },
  },
  {
    accessorKey: 'gender',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Género" column={column} />
    },
  },
  {
    accessorKey: 'age',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Edad" column={column} />
    },
  },
  {
    accessorKey: 'salary',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Salario" column={column} />
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
