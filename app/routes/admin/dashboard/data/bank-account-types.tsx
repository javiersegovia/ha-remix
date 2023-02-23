import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const bankAccountTypes = await getBankAccountTypes()

  return json({
    bankAccountTypes,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Tipo de cuentas bancarias | HoyAdelantas',
  }
}

export default function BankAccountTypesIndexRoute() {
  const { bankAccountTypes } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = bankAccountTypes?.map((bankAccountTypes) => ({
    rowId: bankAccountTypes.id,
    href: `/admin/dashboard/data/bank-account-types/${bankAccountTypes.id}`,
    items: [bankAccountTypes.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Tipos de cuentas bancarias"
          actions={
            <Button href="create" size="SM">
              Crear tipo de cuenta bancaria
            </Button>
          }
        />

        {bankAccountTypes?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado tipos de cuentas bancarias.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
