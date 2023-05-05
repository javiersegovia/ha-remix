import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { INavPath } from '~/components/SideBar/DashboardSideBar'
import type { User } from '@prisma/client'

import { PermissionCode } from '@prisma/client'
import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { HiOutlineHome } from 'react-icons/hi'
import { MdPersonOutline } from 'react-icons/md'
import { RiFileList2Line } from 'react-icons/ri'

import { DashboardSideBar } from '~/components/SideBar/DashboardSideBar'
import { requireUser } from '~/session.server'
import { prisma } from '~/db.server'
import {
  getEmployeeEnabledBenefits,
  hasPermissionByUserId,
} from '~/services/permissions/permissions.server'

export type DashboardLoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>
  canUsePayrollAdvances: boolean
  hasPayrollAdvances: boolean
}

const defaultNavPaths: INavPath[] = [
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

const getEmployeeData = (userId: User['id']) => {
  return prisma.employee.findFirst({
    where: {
      user: {
        id: userId,
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
      benefits: {
        select: {
          id: true,
          companyBenefit: {
            select: {
              id: true,
            },
          },
        },
      },
      employeeGroups: {
        select: {
          benefits: {
            select: {
              id: true,
              companyBenefit: {
                select: {
                  id: true,
                },
              },
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
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request)

  const employeeData = await getEmployeeData(user.id)

  const benefits = await getEmployeeEnabledBenefits(user.id)

  const canUsePayrollAdvances = process.env.SLUG_PAYROLL_ADVANCE
    ? benefits.some((b) => b.slug === process.env.SLUG_PAYROLL_ADVANCE)
    : true

  const hasPayrollAdvances = Boolean(employeeData?.payrollAdvances?.length)

  const canManageBenefits = await hasPermissionByUserId(
    user.id,
    PermissionCode.MANAGE_BENEFIT
  )

  const canManageCompany = await hasPermissionByUserId(
    user.id,
    PermissionCode.MANAGE_COMPANY
  )

  const canManageEmployeesMainInformation = await hasPermissionByUserId(
    user.id,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const historyNavPath: INavPath = {
    icon: RiFileList2Line,
    path: '/dashboard/history/payroll-advances',
    title: 'Historial',
  }

  const companyManagementNavPath: INavPath = {
    icon: MdPersonOutline,
    title: 'Administrar',
    subPaths: [],
  }

  let navPaths = [...defaultNavPaths]

  if (canUsePayrollAdvances || hasPayrollAdvances) {
    navPaths.push(historyNavPath)
  }

  if (canManageCompany) {
    companyManagementNavPath.subPaths.push({
      title: 'Perfil de empresa',
      path: '/dashboard/manage/company',
    })
  }

  if (canManageBenefits) {
    companyManagementNavPath.subPaths.push({
      title: 'Beneficios',
      path: '/dashboard/manage/benefits',
    })
  }

  if (canManageEmployeesMainInformation) {
    companyManagementNavPath.subPaths.push({
      title: 'Colaboradores',
      path: '/dashboard/manage/employees',
    })
  }

  if (companyManagementNavPath.subPaths.length > 0) {
    navPaths.push(companyManagementNavPath)
  }

  return json({
    user,
    navPaths,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio | HoyTrabajas Beneficios',
  }
}

export default function AdminDashboardRoute() {
  const { navPaths } = useLoaderData<typeof loader>()

  return (
    <DashboardSideBar paths={navPaths as INavPath[]} logoHref="/dashboard">
      <Outlet />
    </DashboardSideBar>
  )
}
