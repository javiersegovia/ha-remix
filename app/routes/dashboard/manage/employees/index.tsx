import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { requireEmployee } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { ButtonIconVariants } from '~/components/Button'
import { Tabs } from '~/components/Tabs/Tabs'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { useToastError } from '~/hooks/useToastError'
import { getEmployeesByCompanyId } from '~/services/employee/employee.server'
import { EmployeeList } from '~/components/Lists/EmployeeList'

export const meta: MetaFunction = () => {
  return {
    title: 'Colaboradores | HoyTrabajas Beneficios',
  }
}

export const manageBenefitPaths = [
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
    PermissionCode.MANAGE_BENEFIT
  )

  return json({
    employees: await getEmployeesByCompanyId(employee.companyId),
  })
}

export default function DashboardEmployeesIndexRoute() {
  const { employees } = useLoaderData<typeof loader>()

  return (
    <>
      <Container className="w-full pb-10">
        <Tabs items={manageBenefitPaths} className="mt-10 mb-8" />

        <>
          <TitleWithActions
            title="Colaboradores"
            className="mb-10"
            actions={
              <Button
                href="/dashboard/manage/employees/create"
                className="flex items-center px-4"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear colaborador
              </Button>
            }
          />

          {employees?.length > 0 ? (
            <EmployeeList employees={employees} showEmployeeGroup />
          ) : (
            <p>No se han encontrado colaboradores</p>
          )}
        </>
      </Container>
    </>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
