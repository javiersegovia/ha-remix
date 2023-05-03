import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { Table } from '~/components/Lists/Table'
import { requireEmployee } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Button } from '~/components/Button'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { getEmployeeGroupsByCompanyId } from '~/services/employee-group/employee-group.server'
import { ButtonIconVariants } from '~/components/Button'
import { Tabs } from '~/components/Tabs/Tabs'
import { employeeTabPaths } from '../employees'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const employeeGroups = await getEmployeeGroupsByCompanyId(employee.companyId)

  return json({
    employeeGroups,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Grupos de Colaboradores | HoyTrabajas Beneficios',
  }
}

export default function EmployeeGroupIndexRoute() {
  const { employeeGroups } = useLoaderData<typeof loader>()

  const headings = [
    'Nombre del grupo',
    'País',
    'Ciudad',
    'Colaboradores',
    'Beneficios',
  ]

  const rows: TableRowProps[] = employeeGroups?.map((eGroup) => ({
    rowId: eGroup.id,
    href: `${eGroup.id}`,
    items: [
      <span className="whitespace-pre-wrap" key={`${eGroup.id}_name`}>
        {eGroup.name}
      </span>,
      <span className="whitespace-pre-wrap" key={`${eGroup.id}_country`}>
        {eGroup.country?.name}
      </span>,
      '-',
      '-',
      <span className="whitespace-pre-wrap" key={`${eGroup.id}_benefits`}>
        {eGroup.benefits.length}
      </span>,
    ],
  }))

  return (
    <>
      <Container className="w-full pb-10">
        <Tabs items={employeeTabPaths} className="mt-10 mb-8" />

        <TitleWithActions
          className="mb-10"
          title="Grupos de Colaboradores"
          actions={
            <Button
              href="/dashboard/manage/employee-groups/create"
              size="SM"
              icon={ButtonIconVariants.CREATE}
            >
              Crear grupo de colaboradores
            </Button>
          }
        />

        {employeeGroups?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado grupos de colaboradores</p>
        )}
      </Container>
      <Outlet />
    </>
  )
}
