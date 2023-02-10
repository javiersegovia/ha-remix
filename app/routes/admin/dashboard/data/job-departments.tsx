import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Table } from '~/components/Lists/Table'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const jobDepartments = await getJobDepartments()

  return json({
    jobDepartments,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Áreas de Trabajo | HoyAdelantas',
  }
}

export default function JobDepartmentIndexRoute() {
  const { jobDepartments } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = jobDepartments?.map((jobDepartments) => ({
    rowId: jobDepartments.id,
    href: `/admin/dashboard/data/job-departments/${jobDepartments.id}`,
    items: [jobDepartments.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Áreas de trabajo"
          actions={
            <Button href="create" size="SM">
              Crear área de trabajo
            </Button>
          }
        />
        {jobDepartments?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado áreas de trabajo</p>
        )}
      </Container>
      <Outlet />
    </>
  )
}
