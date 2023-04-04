import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'

import { requireEmployee } from '~/session.server'
import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'

import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import {
  deleteEmployeeGroupById,
  getEmployeeGroupById,
  updateEmployeeGroupById,
} from '~/services/employee-group/employee-group.server'
import { employeeGroupValidator } from '~/services/employee-group/employee-group.schema'
import { EmployeeGroupForm } from '~/components/Forms/EmployeeGroupForm'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const { employeeGroupId } = params

  if (!employeeGroupId) {
    throw badRequest({
      message: 'No se encontró el ID del grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  const employeeGroup = await getEmployeeGroupById(employeeGroupId)

  if (!employeeGroup) {
    throw badRequest({
      message: 'No se encontró el grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  const benefits = await getAvailableBenefitsByCompanyId(employee.companyId)

  return json({ benefits, employeeGroup })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const { employeeGroupId } = params

  if (!employeeGroupId) {
    throw badRequest({
      message: 'No se encontró el ID del grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await employeeGroupValidator.validate(formData)

    if (error) {
      return validationError(error, submittedData)
    }

    await updateEmployeeGroupById(data, employeeGroupId)
  } else if (request.method === 'DELETE') {
    await deleteEmployeeGroupById(employeeGroupId)
  }

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = '/dashboard/manage/employee-groups' as const

export default function EmployeeGroupUpdateRoute() {
  const { employeeGroup, benefits } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar grupo de colaboradores</Title>

        <EmployeeGroupForm
          buttonText="Guardar"
          benefits={benefits}
          defaultValues={{
            name: employeeGroup.name,
            benefits: employeeGroup.benefits,
          }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
