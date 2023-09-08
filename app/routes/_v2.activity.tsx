import { json, type LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData, useOutlet } from '@remix-run/react'
import { $path } from 'remix-routes'
import { Tabs } from '~/components/Tabs/Tabs'
import { requireEmployee } from '~/session.server'
import { hasPermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const canViewActivityIndicators = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.VIEW_INDICATOR_ACTIVITY
  )

  const canManageCompanyPoints = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_COMPANY_POINTS
  )

  const navPaths = []

  if (canViewActivityIndicators) {
    navPaths.push({
      title: 'Indicadores',
      path: $path('/activity/indicators'),
    })
  }

  if (canManageCompanyPoints) {
    navPaths.push({
      title: 'Puntos',
      path: $path('/activity/points'),
    })
  }

  return json({ navPaths })
}

const ActivityIndexRoute = () => {
  const { navPaths } = useLoaderData<typeof loader>()
  const outlet = useOutlet()

  return (
    <>
      {navPaths?.length > 1 && (
        <>
          <Tabs items={navPaths} />
          <div className="mb-10" />
        </>
      )}

      {outlet}
    </>
  )
}

export default ActivityIndexRoute
