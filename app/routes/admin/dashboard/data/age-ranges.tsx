import { Outlet, useLoaderData } from '@remix-run/react'
import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { json } from '@remix-run/node'
import { getAgeRanges } from '~/services/age-range/age-range.server'
import { requireAdminUserId } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Button } from '~/components/Button'
import { formatAgeRange } from '~/utils/formatAgeRange'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const ageRanges = await getAgeRanges()

  return json({ ageRanges })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Rangos de Edad | HoyTrabajas Beneficios',
  }
}

export default function AgeRangeIndexRoute() {
  const { ageRanges } = useLoaderData<typeof loader>()

  const headings = ['Rango']

  const rows: TableRowProps[] = ageRanges?.map(({ id, minAge, maxAge }) => ({
    rowId: id,
    href: `/admin/dashboard/data/age-ranges/${id}`,
    items: [formatAgeRange(minAge, maxAge)],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Rango de edad"
          actions={
            <Button href="create" size="SM">
              Crear rango de edad
            </Button>
          }
        />
        {ageRanges?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado rangos de edad</p>
        )}
      </Container>
      <Outlet />
    </>
  )
}
