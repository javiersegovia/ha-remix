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

import { badRequest } from '~/utils/responses'
import { FormActions } from '~/components/FormFields/FormActions'
import { Title } from '~/components/Typography/Title'

import { getBanks, validateBankAccount } from '~/services/bank/bank.server'
import { getCountries } from '~/services/country/country.server'
import { getGenders } from '~/services/gender/gender.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getJobPositions } from '~/services/job-position/job-position.server'
import { requireEmployee } from '~/session.server'
import {
  getEmployeeById,
  updateEmployeeByCompanyAdminForm,
} from '~/services/employee/employee.server'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { prisma } from '~/db.server'
import { getUserRoles } from '~/services/user-role/user-role.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { EmployeeForm } from '~/components/Forms/EmployeeForm'
import { GoBack } from '~/components/Button/GoBack'
import { Container } from '~/components/Layout/Container'
import { companyDashboardEmployeeValidatorServer } from '~/services/employee/employee.schema'

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
      redirect: `/dashboard/manage/employees`,
    })
  }

  const employeExists = prisma.employee.findUnique({
    where: { id: employeeId },
  })

  if (!employeExists) {
    throw badRequest({
      message: 'No pudimos encontrar el colaborador',
      redirect: `/dashboard/manage/employees`,
    })
  }

  const [
    employee,
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
    getEmployeeById(employeeId),
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

  const canManageFinancialInformation = await hasPermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

  return json({
    employee,
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

  const { bankAccount } = data || {}

  if (bankAccount) {
    validateBankAccount(bankAccount, formId)
  }

  const { employeeId } = params

  if (!employeeId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del colaborador',
      redirect: `/dashboard/manage/employees`,
    })
  }

  await updateEmployeeByCompanyAdminForm(data, employeeId)

  return redirect(`/dashboard/manage/employees`, 301)
}

export default function CompanyDashboardUpdateEmployeeRoute() {
  const {
    employee,
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
    <>
      <Container className="w-full py-10">
        <GoBack redirectTo="/dashboard/manage/employees" />

        <Title>Actualizar colaborador</Title>

        {employee ? (
          <div className="mt-10">
            <EmployeeForm
              defaultValues={{
                ...employee,
                startedAt: employee.startedAt
                  ? new Date(employee.startedAt)
                  : null,
                inactivatedAt: employee.inactivatedAt
                  ? new Date(employee.inactivatedAt)
                  : null,
                birthDay: employee.birthDay
                  ? new Date(employee.birthDay)
                  : null,
                documentIssueDate: employee.documentIssueDate
                  ? new Date(employee.documentIssueDate)
                  : null,
              }}
              countries={countries}
              jobPositions={jobPositions}
              jobDepartments={jobDepartments}
              banks={banks}
              bankAccountTypes={bankAccountTypes}
              identityDocumentTypes={identityDocumentTypes}
              genders={genders}
              userRoles={userRoles}
              validator={companyDashboardEmployeeValidatorServer}
              actions={<FormActions title="Guardar" />}
              permissions={{
                canManageFinancialInformation,
              }}
            />
          </div>
        ) : (
          <p>Ha ocurrido un error.</p>
        )}
      </Container>
    </>
  )
}
