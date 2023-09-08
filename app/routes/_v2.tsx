import type { LoaderArgs } from '@remix-run/node'

import { useLoaderData, useOutlet } from '@remix-run/react'
import { Navbar } from '~/components/Navbar/Navbar'
import { requireEmployee } from '~/session.server'
import { json } from '@remix-run/node'
import { hasPermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { Container } from '~/components/Layout/Container'

const {
  MANAGE_COMPANY,
  MANAGE_EMPLOYEE_MAIN_INFORMATION,
  VIEW_INDICATOR_ACTIVITY,
  MANAGE_COMPANY_POINTS,
} = PermissionCode

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const {
    user: { id: userId, firstName, lastName },
  } = employee

  const [
    canManageCompany,
    canManageEmployees,
    canViewIndicatorActivity,
    canManageCompanyPoints,
  ] = await Promise.all([
    hasPermissionByUserId(userId, MANAGE_COMPANY),
    hasPermissionByUserId(userId, MANAGE_EMPLOYEE_MAIN_INFORMATION),
    hasPermissionByUserId(userId, VIEW_INDICATOR_ACTIVITY),
    hasPermissionByUserId(userId, MANAGE_COMPANY_POINTS),
  ])

  return json({
    avatar: {
      initials: `${firstName?.[0]}${lastName?.[0]}`,
    },
    permissions: {
      canManageCompany,
      canManageEmployees,
      canViewIndicatorActivity,
      canManageCompanyPoints,
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
