import type { LoaderFunction } from '@remix-run/server-runtime'
import { getEmployee, requireUserId } from '~/session.server'
import { json } from '@remix-run/node'
import { Form as RemixForm, Outlet } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return json({
    employee: await getEmployee(request),
  })
}

export default function DashboardRoute() {
  return (
    <section>
      WELCOME
      <RemixForm action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
      </RemixForm>
      <Outlet />
    </section>
  )
}
