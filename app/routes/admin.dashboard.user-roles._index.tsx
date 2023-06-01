import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireAdminUserId } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Button } from '~/components/Button'
import { getUserRoles } from '~/services/user-role/user-role.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const userRoles = await getUserRoles()

  return json({
    userRoles,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Roles de Usuario | HoyTrabajas Beneficios',
  }
}

export default function UserRoleIndexRoute() {
  const { userRoles } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = userRoles?.map((userRoles) => ({
    rowId: userRoles.id,
    href: `/admin/dashboard/user-roles/${userRoles.id}`,
    items: [userRoles.name],
  }))
  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Roles de Usuario"
          actions={
            <Button href="create" size="SM">
              Crear rol
            </Button>
          }
        />
        {userRoles?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado roles de usuario</p>
        )}
      </Container>
    </>
  )
}
