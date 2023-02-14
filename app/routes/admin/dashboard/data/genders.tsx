import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'

import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { requireAdminUserId } from '~/session.server'
import { getGenders } from '~/services/gender/gender.server'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Button } from '~/components/Button'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const genders = await getGenders()

  return json({
    genders,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Géneros | HoyAdelantas',
  }
}

export default function GenderIndexRoute() {
  const { genders } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = genders?.map((genders) => ({
    rowId: genders.id,
    href: `/admin/dashboard/data/genders/${genders.id}`,
    items: [genders.name],
  }))
  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Géneros"
          actions={
            <Button href="create" size="SM">
              Crear género
            </Button>
          }
        />
        {genders?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado géneros</p>
        )}
      </Container>
      <Outlet />
    </>
  )
}
