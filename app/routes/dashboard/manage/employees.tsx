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
import { CompanyEmployeeList } from '~/components/Lists/CompanyEmployeeList'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'

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

  return json({
    employees: await getCompanyEmployeesByCompanyId(employee.companyId),
    companyBenefitsIds: employee.company.benefits?.map((b) => b.id),
    canManageEmployeeGroup,
  })
}

export default function DashboardEmployeesIndexRoute() {
  const { employees, canManageEmployeeGroup, companyBenefitsIds } =
    useLoaderData<typeof loader>()

  return (
    <>
      <Container className="w-full pb-10">
        {canManageEmployeeGroup && (
          <Tabs items={employeeTabPaths} className="mt-10" />
        )}

        <>
          {true ? (
            // {employees?.length > 0 ? (
            <>
              <TitleWithActions
                title="Colaboradores"
                className="my-10"
                actions={<ManageEmployeeActions />}
              />

              <CompanyEmployeeList
                employees={employees}
                companyBenefitsIds={companyBenefitsIds}
              />
            </>
          ) : (
            <TableIsEmpty
              title="Aún no tienes ningún colaborador"
              description="¿Qué esperas para añadir a tus colaboradores?"
              actions={<ManageEmployeeActions />}
              className="mt-10"
            />
          )}
        </>
      </Container>

      <Outlet />
    </>
  )
}

export const ManageEmployeeActions = () => (
  <Button
    href="/dashboard/manage/employees/create/account"
    className="flex items-center px-4"
    size="SM"
    icon={ButtonIconVariants.CREATE}
  >
    Crear colaborador
  </Button>
)

export const CatchBoundary = () => {
  useToastError()
  return null
}
