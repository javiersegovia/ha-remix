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

  const salaryRanges = await getSalaryRanges()

  return json({
    salaryRanges,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Rangos Salariales | HoyTrabajas Beneficios',
  }
}

export default function SalaryRangesIndexRoute() {
  const { salaryRanges } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = salaryRanges?.map((salaryRanges) => ({
    rowId: salaryRanges.id,
    href: `/admin/dashboard/data/salary-ranges/${salaryRanges.id}`,
    items: [salaryRanges.name],
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

        {salaryRanges?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado rangos salariales.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
