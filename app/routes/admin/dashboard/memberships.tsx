import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { getMemberships } from '~/services/membership/membership.server'
import { requireAdminUserId } from '~/session.server'
import { MembershipList } from '~/components/Lists/MembershipList'
import { Container } from '~/components/Layout/Container'
import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Membresías | HoyAdelantas',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return json({
    memberships: await getMemberships(),
  })
}

export default function MembershipsIndexRoute() {
  const { memberships } = useLoaderData<typeof loader>()

  return (
    <>
      <Container>
        <>
          <TitleWithActions
            title="Membresías"
            className="mb-10"
            actions={
              <Button
                href="/admin/dashboard/memberships/create"
                className="flex items-center px-4"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear membresía
              </Button>
            }
          />

          {memberships?.length > 0 ? (
            <MembershipList memberships={memberships} />
          ) : (
            <p>No se han encontrado membresías</p>
          )}
        </>
      </Container>

      <Outlet />
    </>
  )
}
