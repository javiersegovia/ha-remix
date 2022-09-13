import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { HiOutlineHome } from 'react-icons/hi'

import type { INavPath } from '~/components/SideBar/DashboardSideBar'
import { DashboardSideBar } from '~/components/SideBar/DashboardSideBar'
import { requireUser } from '~/session.server'

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)

  return json<LoaderData>({
    user,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio | HoyAdelantas',
  }
}

const navPaths: INavPath[] = [
  {
    icon: HiOutlineHome,
    path: '/dashboard/overview',
    title: 'Inicio',
  },
  {
    icon: HiOutlineHome,
    path: '/dashboard/payroll-advances',
    title: 'Mis solicitudes',
  },
]

export default function AdminDashboardRoute() {
  const { user } = useLoaderData<LoaderData>()

  return (
    <DashboardSideBar paths={navPaths} user={user} logoHref="/dashboard">
      <Outlet />
    </DashboardSideBar>
  )
}
