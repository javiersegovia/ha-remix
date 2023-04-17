import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { prisma } from '~/db.server'
import { badRequest } from '~/utils/responses'
import {
  getEmployeeById,
  updateEmployeeByCompanyAdminExtraInformationForm,
} from '~/services/employee/employee.server'
import { getCountries } from '~/services/country/country.server'
import { getJobPositions } from '~/services/job-position/job-position.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getGenders } from '~/services/gender/gender.server'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { EmployeeExtraInformationForm } from '~/components/Forms/Employees/EmployeeExtraInformationForm'
import { employeeExtraInformationValidator } from '~/services/employee/employee.schema'
import { SubmitButton } from '~/components/SubmitButton'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
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

  const [employee, countries, jobPositions, jobDepartments, genders] =
    await Promise.all([
      getEmployeeById(employeeId),
      getCountries(),
      getJobPositions(),
      getJobDepartments(),
      getGenders(),
    ])

  if (!employee) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del colaborador',
      redirect: `/dashboard/manage/employees`,
    })
  }

  return json({
    employee,
    countries,
    jobPositions,
    jobDepartments,
    genders,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { data, submittedData, error } =
    await employeeExtraInformationValidator.validate(await request.formData())

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

  const { id } = await updateEmployeeByCompanyAdminExtraInformationForm(
    data,
    employeeId
  )

  return redirect(`/dashboard/manage/employees/${id}/bank-account`, 301)
}

const UpdateEmployeeExtraInformationRoute = () => {
  const { employee, countries, jobPositions, jobDepartments, genders } =
    useLoaderData<typeof loader>()

  const {
    countryId,
    stateId,
    cityId,
    jobPositionId,
    jobDepartmentId,
    genderId,

    address,
    numberOfChildren,
    phone,

    birthDay,
    documentIssueDate,
    inactivatedAt,
    startedAt,
  } = employee

  return (
    <>
      <div className="mt-10" />

      <EmployeeExtraInformationForm
        defaultValues={{
          countryId,
          stateId,
          cityId,
          jobPositionId,
          jobDepartmentId,
          genderId,

          address,
          numberOfChildren,
          phone,

          birthDay: birthDay ? new Date(Date.parse(birthDay)) : null,

          documentIssueDate: documentIssueDate
            ? new Date(Date.parse(documentIssueDate))
            : null,

          startedAt: startedAt ? new Date(Date.parse(startedAt)) : null,

          inactivatedAt: inactivatedAt
            ? new Date(Date.parse(inactivatedAt))
            : null,
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

            <SubmitButton className="w-full md:w-auto">Continuar</SubmitButton>
          </div>
        }
        countries={countries}
        jobPositions={jobPositions}
        jobDepartments={jobDepartments}
        genders={genders}
        validator={employeeExtraInformationValidator}
      />
    </>
  )
}

export default UpdateEmployeeExtraInformationRoute
