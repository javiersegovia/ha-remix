import type { LoaderFunction } from '@remix-run/server-runtime'

import { requireUserId } from '~/session.server'
import { useEmployee } from '~/utils/utils'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return null
}

export default function DashboardAccountRoute() {
  const employee = useEmployee()

  return <p>{employee?.user.email}</p>
}
