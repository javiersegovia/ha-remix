import type { LoaderArgs } from '@remix-run/server-runtime'

import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  // const canManageFinancialInformation = await hasPermissionByUserId(
  //   currentEmployee.userId,
  //   PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  // )

  return null
}

const CreateEmployeeAccountRoute = () => {
  return (
    <>
      <div className="mt-10">Formulario aqui (aacc bancaria)</div>
    </>
  )
}

export default CreateEmployeeAccountRoute
