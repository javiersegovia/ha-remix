import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { HiOutlineHome } from 'react-icons/hi'
import { MdPersonOutline } from 'react-icons/md'
import { RiFileList2Line } from 'react-icons/ri'

import type { INavPath } from '~/components/SideBar/DashboardSideBar'
import { DashboardSideBar } from '~/components/SideBar/DashboardSideBar'
import { requireUser } from '~/session.server'
import { prisma } from '~/db.server'
import { canUseBenefit } from '~/services/permissions/permissions.server'

export type DashboardLoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>
  canUsePayrollAdvances: boolean
  hasPayrollAdvances: boolean
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)

  const employeeData = await prisma.employee.findFirst({
    where: {
      user: {
        id: user.id,
      },
    },
    select: {
      company: {
        select: {
          name: true,
          benefits: {
            select: {
              id: true,
            },
          },
        },
      },
      membership: {
        select: { id: true, name: true, benefits: { select: { id: true } } },
      },
      payrollAdvances: {
        select: {
          id: true,
        },
      },
    },
  })

  const benefits = await canUseBenefit(
    employeeData?.membership?.benefits,
    employeeData?.company.benefits
  )

  const canUsePayrollAdvances = process.env.SLUG_PAYROLL_ADVANCE
    ? benefits.some((b) => b.slug === process.env.SLUG_PAYROLL_ADVANCE)
    : true

  const hasPayrollAdvances = !!employeeData?.payrollAdvances?.length

  return json<DashboardLoaderData>({
    user,
    canUsePayrollAdvances,
    hasPayrollAdvances,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio | HoyAdelantas',
  }
}

export default function AdminDashboardRoute() {
  const { canUsePayrollAdvances, hasPayrollAdvances } =
    useLoaderData<DashboardLoaderData>()

  const navPaths: INavPath[] = [
    {
      icon: HiOutlineHome,
      path: '/dashboard/overview',
      title: 'Beneficios',
    },
    {
      icon: MdPersonOutline,
      path: '/dashboard/account',
      title: 'Datos del perfil',
    },
  ]

  if (canUsePayrollAdvances || hasPayrollAdvances) {
    navPaths.push({
      icon: RiFileList2Line,
      path: '/dashboard/history/payroll-advances',
      title: 'Historial',
    })
  }

  return (
    <DashboardSideBar paths={navPaths} logoHref="/dashboard">
      <Outlet />
    </DashboardSideBar>
  )
}
