import { Outlet } from '@remix-run/react'
import { Tabs } from '~/components/Tabs/Tabs'

const navPaths = [
  {
    title: 'Adelantos de Nómina',
    path: 'payroll-advances',
  },
  {
    title: 'Adelantos de Prima',
    path: 'premium-advances',
  },
]

export default function AdminDashboardHistoryRoute() {
  return (
    <>
      <div className="mx-auto mt-8 w-full max-w-screen-xl p-2 sm:p-8">
        <Tabs items={navPaths} />

        <Outlet />
      </div>
    </>
  )
}
