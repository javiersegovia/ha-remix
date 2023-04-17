import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'

import { json } from '@remix-run/server-runtime'
import { PermissionCode } from '@prisma/client'

import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { prisma } from '~/db.server'
import { badRequest } from '~/utils/responses'
import {
  getEmployeeById,
  updateEmployeeByCompanyAdminBankAccountForm,
} from '~/services/employee/employee.server'
import { getBanks } from '~/services/bank/bank.server'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { Link, useLoaderData } from '@remix-run/react'
import { EmployeeBankAccountForm } from '~/components/Forms/Employees/EmployeeBankAccountForm'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { employeeBankAccountValidator } from '~/services/employee/employee.schema'
import { validationError } from 'remix-validated-form'

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
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
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

  const [employee, banks, bankAccountTypes, identityDocumentTypes] =
    await Promise.all([
      getEmployeeById(employeeId),
      getBanks(),
      getBankAccountTypes(),
      getIdentityDocumentTypes(),
    ])

  if (!employee) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del empleado',
      redirect: `/dashboard/manage/employees`,
    })
  }

  return json({
    employee,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

  const { data, submittedData, error } =
    await employeeBankAccountValidator.validate(await request.formData())

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

  const { id } = await updateEmployeeByCompanyAdminBankAccountForm(
    data,
    employeeId
  )

  return redirect(`/dashboard/manage/employees/${id}/details`, 301)
}

const UpdateEmployeeBankAccountRoute = () => {
  const { employee, banks, bankAccountTypes, identityDocumentTypes } =
    useLoaderData<typeof loader>()

  return (
    <>
      <div className="my-10" />

      <EmployeeBankAccountForm
        defaultValues={{
          bankId: employee.bankAccount?.bankId,
          accountNumber: employee.bankAccount?.accountNumber,
          accountTypeId: employee.bankAccount?.accountTypeId,
          identityDocument: employee.bankAccount?.identityDocument
            ? {
                documentTypeId:
                  employee.bankAccount?.identityDocument?.documentTypeId,
                value: employee.bankAccount?.identityDocument?.value,
              }
            : undefined,
        }}
        actions={
          <div className="mt-10 flex flex-col items-center justify-end gap-4 md:flex-row">
            <Link to="/dashboard/manage/employees" className="w-full md:w-auto">
              <ButtonElement
                variant={ButtonColorVariants.SECONDARY}
                className="md:w-auto"
              >
                Cancelar
              </ButtonElement>
            </Link>

            <SubmitButton className="w-full md:w-auto">Guardar</SubmitButton>
          </div>
        }
        banks={banks}
        bankAccountTypes={bankAccountTypes}
        identityDocumentTypes={identityDocumentTypes}
        validator={employeeBankAccountValidator}
      />
    </>
  )
}

export default UpdateEmployeeBankAccountRoute
