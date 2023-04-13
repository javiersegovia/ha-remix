import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const salaryRange = await getSalaryRanges()

  return json({
    salaryRange,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Rangos Salariales | HoyTrabajas Beneficios',
  }
}

export default function SalaryRangesIndexRoute() {
  const { salaryRange } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = salaryRange?.map((salaryRange) => ({
    rowId: salaryRange.id,
    href: `/admin/dashboard/data/salary-ranges/${salaryRange.id}`,
    items: [salaryRange.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Rangos Salariales"
          actions={
            <Button href="create" size="SM">
              Crear rango salarial
            </Button>
          }
        />

        {salaryRange?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado rangos salariales.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
