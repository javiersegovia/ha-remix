import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { Outlet } from '@remix-run/react'
import { json } from '@remix-run/node'
import { HiOutlineHome, HiOutlineOfficeBuilding } from 'react-icons/hi'
import { MdAttachMoney } from 'react-icons/md'
import { FiSettings } from 'react-icons/fi'

import { requireAdminUser } from '~/session.server'
import type { INavPath } from '~/components/SideBar/DashboardSideBar'
import { DashboardSideBar } from '~/components/SideBar/DashboardSideBar'

type LoaderData = {
  user: Awaited<ReturnType<typeof requireAdminUser>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const adminUser = await requireAdminUser(request)
  return json<LoaderData>({ user: adminUser })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Inicio | HoyAdelantas',
  }
}

const navPaths: INavPath[] = [
  {
    icon: HiOutlineHome,
    path: '/admin/dashboard',
    title: 'Inicio',
  },
  {
    icon: HiOutlineOfficeBuilding,
    title: 'Compañías',
    path: '/admin/dashboard/companies',
  },
  {
    icon: MdAttachMoney,
    path: '/admin/dashboard/payroll-advances',
    title: 'Adelantos',
  },
  {
    icon: FiSettings,
    path: '/admin/dashboard/settings',
    title: 'Configuración',
  },
]

export default function AdminDashboardRoute() {
  return (
    <DashboardSideBar
      variant="DARK"
      paths={navPaths}
      logoHref="/admin/dashboard"
    >
      <div className="p-2 sm:p-8">
        <Outlet />
      </div>
    </DashboardSideBar>
  )
}
