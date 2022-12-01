import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { HiPlus } from 'react-icons/hi'
import { getMemberships } from '~/services/membership/membership.server'
import { requireAdminUserId } from '~/session.server'
import { MembershipList } from '~/components/Lists/MembershipList'
import { Container } from '~/components/Layout/Container'
import { Button } from '~/components/Button'
import { Title } from '~/components/Typography/Title'

type LoaderData = {
  memberships: Awaited<ReturnType<typeof getMemberships>>
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Membresías | HoyAdelantas',
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  return json<LoaderData>({
    memberships: await getMemberships(),
  })
}

export default function MembershipsIndexRoute() {
  const { memberships } = useLoaderData<LoaderData>()

  return (
    <>
      <Container>
        <>
          <div className="mb-8 mt-2 flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
            <Title>Membresías</Title>
            <ManagementButtons />
          </div>

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

const ManagementButtons = () => {
  return (
    <div className="mt-4 flex w-full items-center justify-center gap-4 md:w-auto lg:mt-0">
      <Button
        href="/admin/dashboard/memberships/create"
        className="flex items-center px-4"
      >
        <HiPlus className="mr-3" />
        Crear membresía
      </Button>
    </div>
  )
}
