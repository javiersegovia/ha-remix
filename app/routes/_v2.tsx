import type { LoaderArgs } from '@remix-run/node'

import { useLoaderData, useOutlet } from '@remix-run/react'
import { Navbar } from '~/components/Navbar/Navbar'
import { requireEmployee } from '~/session.server'
import { json } from '@remix-run/node'
import { hasPermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { Container } from '~/components/Layout/Container'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const {
    user: { id: userId, firstName, lastName },
  } = employee

  const canManageCompany = await hasPermissionByUserId(
    userId,
    PermissionCode.MANAGE_COMPANY
  )

  const canManageEmployees = await hasPermissionByUserId(
    userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  return json({
    avatar: {
      initials: `${firstName?.[0]}${lastName?.[0]}`,
    },
    permissions: {
      canManageCompany,
      canManageEmployees,
    },
  })
}

const V2Layout = () => {
  const { avatar, permissions } = useLoaderData<typeof loader>()
  const outlet = useOutlet()

  return (
    <>
      <Navbar avatar={avatar} permissions={permissions} />

      <header className="relative top-0 block">
        <div className="absolute top-0 -z-10 h-96 w-full bg-gray-200" />
      </header>

      <main>
        <Container className="relative mt-20 block w-full px-0 sm:px-10">
          <div className="min-h-[500px] rounded-3xl bg-white p-5">{outlet}</div>
        </Container>
      </main>
    </>
  )
}

export default V2Layout
