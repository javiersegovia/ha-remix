import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { requireEmployee } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { ButtonIconVariants } from '~/components/Button'
import { Tabs } from '~/components/Tabs/Tabs'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import { useToastError } from '~/hooks/useToastError'
import { getCompanyEmployeesByCompanyId } from '~/services/employee/employee.server'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { EmployeeStatusPill } from '~/components/Pills/EmployeeStatusPill'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'

export const meta: MetaFunction = () => {
  return {
    title: 'Colaboradores | HoyTrabajas Beneficios',
  }
}

export const employeeTabPaths = [
  {
    title: 'Colaboradores',
    path: '/dashboard/manage/employees',
  },
  {
    title: 'Grupos de colaboradores',
    path: '/dashboard/manage/employee-groups',
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const canManageEmployeeGroup = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const employeeCount = await prisma.employee.count()
  const { itemsPerPage } = constants

  return json({
    employees: await getCompanyEmployeesByCompanyId(employee.companyId, {
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }),
    pagination: {
      currentPage,
      totalPages: Math.ceil(employeeCount / itemsPerPage),
    },
    companyBenefitsIds: employee.company.benefits?.map((b) => b.id),
    canManageEmployeeGroup,
  })
}

export default function DashboardEmployeesIndexRoute() {
  const { employees, pagination, canManageEmployeeGroup } =
    useLoaderData<typeof loader>()

  const headings = [
    'Nombre',
    'Ciudad',
    'Área',
    'Grupos asignados',
    'Beneficios',
    'Estado',
  ]

  const rows: TableRowProps[] = employees?.map(
    ({ id, user, city, jobDepartment, employeeGroups, benefits, status }) => ({
      rowId: id,
      href: `${id}`,
      items: [
        <>
          <span className="whitespace-pre-wrap" key={`${id}_name`}>
            {`${user.firstName} ${user.lastName}`}
          </span>
          <div className="text-sm text-gray-500">{user.email}</div>
        </>,

        city ? (
          <span className="whitespace-pre-wrap" key={`${id}_city`}>
            {city?.name}
          </span>
        ) : (
          '-'
        ),
        jobDepartment ? (
          <span className="whitespace-pre-wrap" key={`${id}_jobDepartment`}>
            {jobDepartment?.name}
          </span>
        ) : (
          '-'
        ),
        employeeGroups?.length > 0 ? (
          <span className="whitespace-pre-wrap" key={`${id}_employeeGroups`}>
            {employeeGroups?.length}
          </span>
        ) : (
          '-'
        ),
        benefits.length > 0 ? (
          <span className="whitespace-pre-wrap" key={`${id}_benefits`}>
            {benefits.length}
          </span>
        ) : (
          '-'
        ),
        status ? (
          <span className="whitespace-pre-wrap" key={`${id}_status`}>
            <EmployeeStatusPill employeeStatus={status} />
          </span>
        ) : (
          '-'
        ),
      ],
    })
  )

  return (
    <>
      <Container className="w-full pb-10">
        {canManageEmployeeGroup && (
          <Tabs items={employeeTabPaths} className="mt-10 mb-8" />
        )}

        <TitleWithActions
          className="mb-10"
          title="Colaboradores"
          actions={
            <Button
              href="/dashboard/manage/employees/create/account"
              size="SM"
              icon={ButtonIconVariants.CREATE}
            >
              Crear colaborador
            </Button>
          }
        />

        {employees?.length > 0 ? (
          <Table headings={headings} rows={rows} pagination={pagination} />
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún grupo de colaboradores"
            description="¿Qué esperas para añadir un colaboradores?"
            actions={
              <Button
                href="/dashboard/manage/employees/create/account"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear grupo de colaboradores
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>
      <Outlet />
    </>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
