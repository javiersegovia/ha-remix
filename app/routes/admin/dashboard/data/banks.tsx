import type { LoaderArgs } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getBanks } from '~/services/bank/bank.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const banks = await getBanks()

  return json({
    banks,
  })
}

export default function BanksIndexRoute() {
  const { banks } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = banks?.map((banks) => ({
    rowId: banks.id,
    href: `/admin/dashboard/data/banks/${banks.id}`,
    items: [banks.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Bancos"
          actions={
            <Button href="create" size="SM">
              Crear banco
            </Button>
          }
        />

        {banks?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado bancos.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
