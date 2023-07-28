import type { TabItem } from '~/components/Tabs/Tabs'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

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
  employeeAccountSchemaWithEmailVerificationValidator,
  employeeAccountValidator,
} from '~/services/employee/employee.schema'
import { createEmployeeByCompanyAdminAccountForm } from '~/services/employee/employee.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import { getUserRoles } from '~/services/user-role/user-role.server'
import { requireEmployee } from '~/session.server'
import { getEmployeeGroupsByCompanyId } from '~/services/employee-group/employee-group.server'
import { badRequest } from '~/utils/responses'
import { Container, ContainerSize } from '~/components/Layout/Container'
import { GoBack } from '~/components/Button/GoBack'
import { TabDesign, Tabs } from '~/components/Tabs/Tabs'

export const meta: MetaFunction = () => {
  return {
    title: 'Crear colaborador | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const [userRoles, benefits, employeeGroups] = await Promise.all([
    getUserRoles(),
    getAvailableBenefitsByCompanyId(currentEmployee.companyId),
    getEmployeeGroupsByCompanyId(currentEmployee.companyId),
  ])

  const canManageFinancialInformation = await hasPermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

  const tabPaths: TabItem[] = [
    {
      title: 'Cuenta de usuario',
      path: `/people/create`,
    },
    {
      title: 'Información complementaria',
      path: `/people/create`,
      disabled: true,
    },
  ]

  if (canManageFinancialInformation) {
    tabPaths.push({
      title: 'Cuenta bancaria',
      path: `/people/create`,
      disabled: true,
    })
  }

  return json({
    userRoles,
    benefits,
    employeeGroups,
    tabPaths,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { data, submittedData, error } =
    await employeeAccountSchemaWithEmailVerificationValidator.validate(
      await request.formData()
    )

  if (error) {
    return validationError(error, submittedData)
  }

  const createdEmployee = await createEmployeeByCompanyAdminAccountForm(
    data,
    currentEmployee.companyId
  )

  if ('id' in createdEmployee) {
    return redirect(`/people/${createdEmployee.id}/extra-information`, 301)
  } else {
    return badRequest({
      message:
        'Ha ocurrido un error inesperado durante la creación del colaborador',
      redirect: '/people',
    })
  }
}

const CreateEmployeeAccountRoute = () => {
  const { benefits, userRoles, employeeGroups, tabPaths } =
    useLoaderData<typeof loader>()

  return (
    <>
      <Container className="w-full py-10" size={ContainerSize.LG}>
        <GoBack redirectTo="/people" description="Crear colaborador" />

        <Tabs items={tabPaths || []} design={TabDesign.UNDERLINE} />

        <div className="my-10" />

        <EmployeeAccountForm
          actions={
            <div className="mt-10 flex flex-col items-center justify-end gap-4 md:flex-row">
              <Link to="/people" className="w-full md:w-auto">
                <ButtonElement
                  variant={ButtonColorVariants.SECONDARY}
                  className="w-full md:w-auto"
                >
                  Cancelar
                </ButtonElement>
              </Link>

              <SubmitButton className="w-full md:w-auto">
                Continuar
              </SubmitButton>
            </div>
          }
          benefits={benefits}
          userRoles={userRoles}
          employeeGroups={employeeGroups}
          validator={employeeAccountValidator}
        />
      </Container>
    </>
  )
}

export default CreateEmployeeAccountRoute
