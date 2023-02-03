import type { LoaderFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '../../../../components/Lists/Table'

import React from 'react'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { requireAdminUserId } from '~/session.server'
import { getJobDepartments } from '../../../../services/job-department/job-department.server'
import { json } from '@remix-run/node'
import { Table } from '~/components/Lists/Table'

type LoaderData = {
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const jobDepartments = await getJobDepartments()

  return json<LoaderData>({
    jobDepartments,
  })
}

export default function JobDepartmentIndexRoute() {
  const { jobDepartments } = useLoaderData<LoaderData>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = jobDepartments?.map((jobDepartments) => ({
    rowId: jobDepartments.id,
    href: `/admin/dashboard/data/job-department/${jobDepartments.id}`,
    items: [jobDepartments.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Área de trabajo"
          actions={
            <Button href="create" size="SM">
              Crear Área de trabajo
            </Button>
          }
        />
        {jobDepartments?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado Áreas de trabajo</p>
        )}
      </Container>
      <Outlet />
    </>
  )
}
