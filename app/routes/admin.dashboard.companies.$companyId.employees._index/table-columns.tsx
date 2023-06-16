import type {
  City,
  Company,
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
  companyId: Company['id']
  fullName: string | null
  email: string | null
  jobDepartment?: Pick<JobDepartment, 'name'> | null
  city?: Pick<City, 'name'> | null
  employeeGroups?: number
  enabledBenefits?: number | null
  status: EmployeeStatus
}

export const columns: ColumnDef<EmployeeDataItem>[] = [
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
            to={$path(
              '/admin/dashboard/companies/:companyId/employees/:employeeId',
              {
                companyId: item.companyId,
                employeeId: item.id,
              }
            )}
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
    accessorKey: 'employeeGroups',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Grupos asignados" column={column} />
    },
    cell: (props) => {
      return (
        <div className="w-full text-center">{props.renderValue<number>()}</div>
      )
    },
  },
  {
    accessorKey: 'enabledBenefits',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return (
        <TableSortableButton title="Beneficios asignados" column={column} />
      )
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
