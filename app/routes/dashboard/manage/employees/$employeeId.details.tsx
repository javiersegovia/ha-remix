import type { LoaderArgs } from '@remix-run/node'

import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { json } from '@remix-run/node'
import { badRequest } from '~/utils/responses'
import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'

const onCloseRedirectTo = '/dashboard/manage/employees' as const

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

  return json({ employeeId })
}

const EmployeeDetailsRoute = () => {
  const { employeeId } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel
        onEditRedirectTo={`/dashboard/manage/employees/${employeeId}/account`}
        onCloseRedirectTo={onCloseRedirectTo}
      >
        <Title>Detalles de colaborador</Title>
        Data aqui
      </RightPanel>
    </Modal>
  )
}

export default EmployeeDetailsRoute
