import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { Link, useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { EmployeeAccountForm } from '~/components/Forms/Employees/EmployeeAccountForm'
import { SubmitButton } from '~/components/SubmitButton'

import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import {
  employeeAccountSectionSchemaWithEmailVerificationValidator,
  employeeAccountSectionValidator,
} from '~/services/employee/employee.schema'
import { createEmployeeByCompanyAdminAccountSectionForm } from '~/services/employee/employee.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { getUserRoles } from '~/services/user-role/user-role.server'
import { requireEmployee } from '~/session.server'
import { getEmployeeGroupsByCompanyId } from '~/services/employee-group/employee-group.server'
import { badRequest } from '~/utils/responses'

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

  const [userRoles, benefits, employeeGroups] = await Promise.all([
    getUserRoles(),
    getAvailableBenefitsByCompanyId(currentEmployee.companyId),
    getEmployeeGroupsByCompanyId(currentEmployee.companyId),
  ])

  return json({
    userRoles,
    benefits,
    employeeGroups,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { data, submittedData, error } =
    await employeeAccountSectionSchemaWithEmailVerificationValidator.validate(
      await request.formData()
    )

  if (error) {
    return validationError(error, submittedData)
  }

  const createdEmployee = await createEmployeeByCompanyAdminAccountSectionForm(
    data,
    currentEmployee.companyId
  )

  if ('id' in createdEmployee) {
    return redirect(
      `/dashboard/manage/employees/${createdEmployee.id}/extra-information`,
      301
    )
  } else {
    return badRequest({
      message:
        'Ha ocurrido un error inesperado durante la creación del colaborador',
      redirect: '/dashboard/manage/employees',
    })
  }
}

const CreateEmployeeAccountRoute = () => {
  const { benefits, userRoles, employeeGroups } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="my-10" />

      <EmployeeAccountForm
        actions={
          <div className="mt-6 flex items-center justify-end gap-4">
            <Link to="/dashboard/manage/employees">
              <ButtonElement
                variant={ButtonColorVariants.SECONDARY}
                className="sm:w-auto"
              >
                Cancelar
              </ButtonElement>
            </Link>

            <SubmitButton className="w-full sm:w-auto">Continuar</SubmitButton>
          </div>
        }
        benefits={benefits}
        userRoles={userRoles}
        employeeGroups={employeeGroups}
        validator={employeeAccountSectionValidator}
      />
    </>
  )
}

export default CreateEmployeeAccountRoute

export const handle = {
  tabPaths: [
    {
      title: 'Cuenta de usuario',
      path: '/dashboard/manage/employees/create/account',
    },
    {
      title: 'Información complementaria',
      path: '/dashboard/manage/employees/create/extra-information',
      disabled: true,
    },
    {
      title: 'Cuenta bancaria',
      path: '/dashboard/manage/employees/create/bank-account',
      disabled: true,
    },
  ],
}
