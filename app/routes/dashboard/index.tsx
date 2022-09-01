import type { LoaderFunction } from '@remix-run/server-runtime'

import { requireUserId } from '~/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return null
}

export default function DashboardIndexRoute() {
  return <div>DashboardIndex Route</div>
}
