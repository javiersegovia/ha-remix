import type { LoaderArgs } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'

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

const UpdateEmployeeExtraInformationRoute = () => {
  return (
    <>
      <div className="mt-10">
        Formulario aqui extra information route(cuenta bancaria)
      </div>
    </>
  )
}

export default UpdateEmployeeExtraInformationRoute
