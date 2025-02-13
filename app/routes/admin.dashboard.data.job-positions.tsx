import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button, ButtonIconVariants } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getJobPositions } from '~/services/job-position/job-position.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const jobPositions = await getJobPositions()

  return json({
    jobPositions,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Cargos de Trabajo | HoyTrabajas Beneficios',
  }
}

export default function JobPositionsIndexRoute() {
  const { jobPositions } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = jobPositions?.map((jobPositions) => ({
    rowId: jobPositions.id,
    href: `/admin/dashboard/data/job-positions/${jobPositions.id}`,
    items: [jobPositions.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Cargos de trabajo"
          actions={
            <Button href="create" size="SM" icon={ButtonIconVariants.CREATE}>
              Crear cargo de trabajo
            </Button>
          }
        />

        {jobPositions?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado cargos de trabajo.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
