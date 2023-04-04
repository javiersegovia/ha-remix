import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { json } from '@remix-run/node'
import { PermissionCode } from '@prisma/client'

import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { employeeGroupValidator } from '~/services/employee-group/employee-group.schema'
import { createEmployeeGroup } from '~/services/employee-group/employee-group.server'
import { EmployeeGroupForm } from '~/components/Forms/EmployeeGroupForm'
import { useLoaderData } from '@remix-run/react'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const benefits = await getAvailableBenefitsByCompanyId(employee.companyId)

  return json({ benefits })
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const formData = await request.formData()

  const { data, submittedData, error } = await employeeGroupValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createEmployeeGroup(data, employee.companyId)

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = '/dashboard/manage/employee-groups' as const

export default function CreateEmployeeGroupRoute() {
  const { benefits } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear grupo de colaboradores</Title>

        <EmployeeGroupForm buttonText="Crear" benefits={benefits} />
      </RightPanel>
    </Modal>
  )
}
