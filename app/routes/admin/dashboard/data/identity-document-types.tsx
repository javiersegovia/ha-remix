import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const identityDocumentTypes = await getIdentityDocumentTypes()

  return json({
    identityDocumentTypes,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Tipos de documento de identidad | HoyAdelantas',
  }
}

export default function IdentityDocumentTypesIndexRoute() {
  const { identityDocumentTypes } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = identityDocumentTypes?.map(
    (identityDocumentTypes) => ({
      rowId: identityDocumentTypes.id,
      href: `/admin/dashboard/data/identity-document-types/${identityDocumentTypes.id}`,
      items: [identityDocumentTypes.name],
    })
  )

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Tipos de documento de identidad"
          actions={
            <Button href="create" size="SM">
              Crear tipos de documento de identidad
            </Button>
          }
        />

        {identityDocumentTypes?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado tipos de documentos de identidad.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
