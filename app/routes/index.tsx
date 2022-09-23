import { Link } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { useOptionalUser } from '~/utils/utils'

export const loader: LoaderFunction = () => {
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    return redirect('/login')
  }

  return null
}

export default function IndexRoute() {
  const user = useOptionalUser()

  return (
    <main className="relative min-h-screen bg-gray-200 sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto mt-10 max-w-sm gap-6 sm:flex sm:max-w-none sm:justify-center">
        <Link
          to="/admin/login"
          className="flex items-center justify-center rounded-md bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-600"
        >
          Admin Log In
        </Link>

        {user ? (
          <Link
            to="/dashboard"
            className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
          >
            Dashboard for {user.email}
          </Link>
        ) : (
          <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <Link
              to="/login"
              className="flex items-center justify-center rounded-md bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-600"
            >
              User Log In
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
