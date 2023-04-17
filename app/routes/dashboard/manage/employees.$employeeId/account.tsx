import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'

import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { EmployeeStatus, PermissionCode } from '@prisma/client'
import { validationError } from 'remix-validated-form'
import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { badRequest } from '~/utils/responses'
import { getUserRoles } from '~/services/user-role/user-role.server'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { getEmployeeGroupsByCompanyId } from '~/services/employee-group/employee-group.server'
import {
  getEmployeeById,
  updateEmployeeByCompanyAdminAccountForm,
} from '~/services/employee/employee.server'
import { EmployeeAccountForm } from '~/components/Forms/Employees/EmployeeAccountForm'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { employeeAccountValidator } from '~/services/employee/employee.schema'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Colaborador no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { employee } = data

  return {
    title: `${employee?.user.firstName} ${employee?.user.lastName} | HoyTrabajas Beneficios`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { employeeId } = params

  const employeeExists = prisma.employee.findUnique({
    where: { id: employeeId },
  })

  if (!employeeExists || !employeeId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del colaborador',
      redirect: `/dashboard/manage/employees`,
    })
  }

  const [employee, userRoles, benefits, employeeGroups] = await Promise.all([
    getEmployeeById(employeeId),
    getUserRoles(),
    getAvailableBenefitsByCompanyId(currentEmployee.companyId),
    getEmployeeGroupsByCompanyId(currentEmployee.companyId),
  ])

  if (!employee) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del colaborador',
      redirect: `/dashboard/manage/employees`,
    })
  }

  return json({
    employee,
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
    await employeeAccountValidator.validate(await request.formData())

  if (error) {
    return validationError(error, submittedData)
  }

  const { employeeId } = params

  const employeeExists = prisma.employee.findUnique({
    where: { id: employeeId },
  })

  if (!employeeExists || !employeeId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del colaborador',
      redirect: `/dashboard/manage/employees`,
    })
  }

  const { id } = await updateEmployeeByCompanyAdminAccountForm(data, employeeId)

  return redirect(`/dashboard/manage/employees/${id}/extra-information`, 301)
}

const CreateEmployeeAccountRoute = () => {
  const { employee, employeeGroups, userRoles, benefits } =
    useLoaderData<typeof loader>()

  return (
    <>
      <div className="my-10" />

      <EmployeeAccountForm
        defaultValues={{
          status: employee?.status || EmployeeStatus.INACTIVE,
          benefits: employee?.benefits,
          availablePoints: employee?.availablePoints,
          employeeGroups: employee?.employeeGroups,
          user: {
            email: employee?.user.email,
            firstName: employee?.user.firstName,
            lastName: employee?.user.lastName,
            roleId: employee?.user.roleId,
          },
        }}
        actions={
          <div className="mt-10 flex flex-col items-center justify-end gap-4 md:flex-row">
            <Link to="/dashboard/manage/employees" className="w-full md:w-auto">
              <ButtonElement variant={ButtonColorVariants.SECONDARY}>
                Cancelar
              </ButtonElement>
            </Link>

            <SubmitButton className="w-full md:w-auto">Continuar</SubmitButton>
          </div>
        }
        benefits={benefits}
        userRoles={userRoles}
        employeeGroups={employeeGroups}
        validator={employeeAccountValidator}
      />
    </>
  )
}

export default CreateEmployeeAccountRoute
