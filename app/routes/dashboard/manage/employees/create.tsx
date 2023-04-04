import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import { PermissionCode } from '@prisma/client'
import { validationError } from 'remix-validated-form'

import { FormActions } from '~/components/FormFields/FormActions'
import { Title } from '~/components/Typography/Title'
import { companyDashboardEmployeeValidatorServer } from '~/services/employee/employee.schema'
import { getBanks, validateBankAccount } from '~/services/bank/bank.server'
import { getCountries } from '~/services/country/country.server'
import { getGenders } from '~/services/gender/gender.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getJobPositions } from '~/services/job-position/job-position.server'
import { requireEmployee } from '~/session.server'
import { createEmployeeByCompanyAdminForm } from '~/services/employee/employee.server'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { getUserRoles } from '~/services/user-role/user-role.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { Container } from '~/components/Layout/Container'
import { GoBack } from '~/components/Button/GoBack'
import { EmployeeForm } from '~/components/Forms/EmployeeForm'

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const canManageFinancialInformation = await hasPermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

  const [
    countries,
    jobPositions,
    jobDepartments,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    genders,
    userRoles,
    benefits,
  ] = await Promise.all([
    getCountries(),
    getJobPositions(),
    getJobDepartments(),
    getBanks(),
    getBankAccountTypes(),
    getIdentityDocumentTypes(),
    getGenders(),
    getUserRoles(),
    getAvailableBenefitsByCompanyId(currentEmployee.companyId),
  ])

  return json({
    countries,
    jobPositions,
    jobDepartments,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    genders,
    userRoles,
    benefits,
    canManageFinancialInformation,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Crear colaborador | HoyTrabajas Beneficios',
  }
}

export const action = async ({ request, params }: ActionArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { data, submittedData, error, formId } =
    await companyDashboardEmployeeValidatorServer.validate(
      await request.formData()
    )

  if (error) {
    return validationError(error, submittedData)
  }

  // const { bankAccount } = data || {}

  // if (bankAccount) {
  //   validateBankAccount(bankAccount, formId)
  // }

  const { fieldErrors } = await createEmployeeByCompanyAdminForm(
    data,
    currentEmployee.companyId
  )

  if (fieldErrors) {
    return validationError(
      {
        fieldErrors,
        formId,
      },
      submittedData
    )
  }

  return redirect(`/dashboard/manage/employees`, 301)
}

export default function CompanyDashboardCreateEmployeeRoute() {
  const {
    countries,
    jobPositions,
    jobDepartments,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    genders,
    userRoles,
    canManageFinancialInformation,
  } = useLoaderData<typeof loader>()

  return (
    <Container className="w-full py-10">
      <GoBack redirectTo="/dashboard/manage/employees" />

      <Title>Crear colaborador</Title>

      <div className="mt-10">
        <EmployeeForm
          countries={countries}
          jobPositions={jobPositions}
          jobDepartments={jobDepartments}
          banks={banks}
          bankAccountTypes={bankAccountTypes}
          identityDocumentTypes={identityDocumentTypes}
          genders={genders}
          userRoles={userRoles}
          validator={companyDashboardEmployeeValidatorServer} // todo: client side validation
          actions={<FormActions title="Crear" />}
          permissions={{
            canManageFinancialInformation,
          }}
        />
      </div>
    </Container>
  )
}
