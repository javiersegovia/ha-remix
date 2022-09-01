import type { LoaderFunction } from '@remix-run/server-runtime'
import { Form, Outlet } from '@remix-run/react'
// import { json } from '@remix-run/node'
import { requireAdminUserId } from '~/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  return null
}

export default function AdminDashboardRoute() {
  return (
    <section>
      ADMIN
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-yellow-600 py-2 px-4 text-blue-100 hover:bg-yellow-500 active:bg-yellow-600"
        >
          Logout
        </button>
      </Form>
      <Outlet />
    </section>
  )
}
