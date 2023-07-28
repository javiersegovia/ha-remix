import type { Employee, User } from '@prisma/client'
import { Link } from '@remix-run/react'
import type { ColumnDef } from '@tanstack/react-table'
import { $path } from 'remix-routes'

import { ControlledCheckbox } from '~/components/FormFields/ControlledCheckbox'

export type EmployeeDataItem = {
  id: Employee['id']
  user: Pick<User, 'email' | 'firstName' | 'lastName'>
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
      />
    ),
    cell: ({ row }) => (
      <ControlledCheckbox
        name="employeesIds"
        value={row.original.id}
        checked={row.getIsSelected()}
        onChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'email',
    header: () => {
      return <span className="block text-left">Nombre colaborador</span>
    },
    accessorKey: 'user.email',
    cell: (props) => {
      const item = props.row.original

      return (
        <>
          <Link
            to={$path('/dashboard/manage/employees/:employeeId/account', {
              employeeId: item.id,
            })}
            className="whitespace-pre-line text-left hover:text-cyan-600"
          >
            <p>
              {item.user.firstName} {item.user.lastName}
            </p>
            <p className="block text-gray-500">{item.user.email}</p>
          </Link>
        </>
      )
    },
  },
]
