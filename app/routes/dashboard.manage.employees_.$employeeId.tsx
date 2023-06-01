import type { LoaderArgs } from '@remix-run/node'

import { Outlet, useLoaderData } from '@remix-run/react'
import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'

import { GoBack } from '~/components/Button/GoBack'
import { Container, ContainerSize } from '~/components/Layout/Container'
import { requireEmployee } from '~/session.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import type { TabItem } from '~/components/Tabs/Tabs'
import { TabDesign, Tabs } from '~/components/Tabs/Tabs'
import { badRequest } from '~/utils/responses'

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { employeeId } = params

  if (!employeeId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del colaborador',
      redirect: `/dashboard/manage/employees/`,
    })
  }

  const canManageFinancialInformation = await hasPermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

  const tabPaths: TabItem[] = [
    {
      title: 'Cuenta de usuario',
      path: `/dashboard/manage/employees/${employeeId}/account`,
    },
    {
      title: 'Información complementaria',
      path: `/dashboard/manage/employees/${employeeId}/extra-information`,
    },
  ]

  if (canManageFinancialInformation) {
    tabPaths.push({
      title: 'Cuenta bancaria',
      path: `/dashboard/manage/employees/${employeeId}/bank-account`,
    })
  }

  return json({ tabPaths })
}

const EmployeeParentRoute = () => {
  const { tabPaths } = useLoaderData<typeof loader>()

  return (
    <Container className="w-full py-10" size={ContainerSize.LG}>
      <GoBack
        redirectTo="/dashboard/manage/employees"
        description="Modificar colaborador"
      />

      <Tabs items={tabPaths} design={TabDesign.UNDERLINE} />

      <Outlet />
    </Container>
  )
}

export default EmployeeParentRoute
