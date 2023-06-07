import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

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
import { Table } from '~/components/Lists/Table'
import { EmployeeStatusPill } from '~/components/Pills/EmployeeStatusPill'
import { prisma } from '~/db.server'
import { filterEmployeeEnabledBenefits } from '../services/permissions/permissions.shared'
import { badRequest } from '~/utils/responses'
import { getPaginationOptions } from '~/utils/getPaginationOptions'

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

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const canManageEmployeeGroup = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const company = await prisma.company.findUnique({
    where: {
      id: employee.companyId,
    },
    select: {
      benefits: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!company) {
    throw badRequest({
      message: 'No pudimos encontrar el ID de la compañía',
      redirect: `/dashboard/overview`,
    })
  }

  const employeeCount = await prisma.employee.count({
    where: {
      companyId: employee.companyId,
    },
  })

  const { take, skip, pagination } = getPaginationOptions({
    request,
    itemsCount: employeeCount,
  })

  const employees = await getCompanyEmployeesByCompanyId(employee.companyId, {
    take,
    skip,
  })

  const employeesWithEnabledBenefitsPromise = employees.map((e) => {
    const filteredBenefits = filterEmployeeEnabledBenefits({
      employeeBenefits: e?.benefits,
      membershipBenefits: e?.membership?.benefits,
      companyBenefitsIds: company.benefits?.map((b) => b.id),
      employeeGroupsBenefits: e?.employeeGroups
        ?.map((eGroup) => eGroup.benefits)
        .flat(),
    })

    return { ...e, enabledBenefits: filteredBenefits.size }
  })

  return json({
    employees: await Promise.all(employeesWithEnabledBenefitsPromise),
    pagination,
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
    ({
      id,
      user,
      city,
      jobDepartment,
      employeeGroups,
      enabledBenefits,
      status,
    }) => ({
      rowId: id,
      href: `${id}/details`,
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

        enabledBenefits > 0 ? (
          <span className="whitespace-pre-wrap" key={`${id}_benefits`}>
            {enabledBenefits}
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
          <Tabs items={employeeTabPaths} className="mb-8 mt-10" />
        )}

        {employees?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Colaboradores"
              actions={
                <Button
                  href="/dashboard/manage/employees/create"
                  size="SM"
                  icon={ButtonIconVariants.CREATE}
                >
                  Crear colaborador
                </Button>
              }
            />
            <Table headings={headings} rows={rows} pagination={pagination} />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún colaborador"
            description="¿Qué esperas para añadir el primero?"
            actions={
              <Button
                href="/dashboard/manage/employees/create/account"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear colaborador
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
