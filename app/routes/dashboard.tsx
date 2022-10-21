import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { Outlet } from '@remix-run/react'
import { json } from '@remix-run/node'
import { HiOutlineHome } from 'react-icons/hi'
import { MdPersonOutline } from 'react-icons/md'
import { RiFileList2Line } from 'react-icons/ri'

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
    icon: MdPersonOutline,
    path: '/dashboard/account',
    title: 'Mi perfil',
  },
  {
    icon: RiFileList2Line,
    path: '/dashboard/history/payroll-advances',
    title: 'Movimientos',
  },
]

export default function AdminDashboardRoute() {
  return (
    <DashboardSideBar paths={navPaths} logoHref="/dashboard">
      <Outlet />
    </DashboardSideBar>
  )
}
