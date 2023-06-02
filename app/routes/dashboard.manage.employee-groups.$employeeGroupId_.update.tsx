import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'

import { requireEmployee } from '~/session.server'
import { Title } from '~/components/Typography/Title'

import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import {
  getEmployeeGroupById,
  updateEmployeeGroupById,
} from '~/services/employee-group/employee-group.server'
import { employeeGroupValidator } from '~/services/employee-group/employee-group.schema'
import { EmployeeGroupForm } from '~/components/Forms/EmployeeGroupForm'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { getCountries } from '~/services/country/country.server'
import { getGenders } from '~/services/gender/gender.server'
import { getAgeRanges } from '~/services/age-range/age-range.server'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { prisma } from '~/db.server'
import { Container } from '~/components/Layout/Container'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { $path } from 'remix-routes'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Grupo de colaborador no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { employeeGroup } = data

  return {
    title: `${employeeGroup?.name} | HoyTrabajas Beneficios`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const { employeeGroupId } = params

  const employeeGroupExists = prisma.employeeGroup.findUnique({
    where: { id: employeeGroupId },
  })

  if (!employeeGroupExists || !employeeGroupId) {
    throw badRequest({
      message: 'No se encontró el ID del grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  const [
    employeeGroup,
    benefits,
    countries,
    genders,
    jobDepartments,
    ageRanges,
    salaryRanges,
  ] = await Promise.all([
    getEmployeeGroupById(employeeGroupId),
    getAvailableBenefitsByCompanyId(employee.companyId),
    getCountries(),
    getGenders(),
    getJobDepartments(),
    getAgeRanges(),
    getSalaryRanges(),
  ])
  if (!employeeGroup) {
    throw badRequest({
      message: 'No se encontró el grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  return json({
    employeeGroup,
    benefits,
    countries,
    genders,
    jobDepartments,
    ageRanges,
    salaryRanges,
  })
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

  const formData = await request.formData()

  const { data, submittedData, error } = await employeeGroupValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await updateEmployeeGroupById(data, employeeGroupId)

  return redirect(
    $path('/dashboard/manage/employee-groups/:employeeGroupId', {
      employeeGroupId,
    })
  )
}

const onCloseRedirectTo = '/dashboard/manage/employee-groups' as const

export default function EmployeeGroupUpdateRoute() {
  const {
    employeeGroup,
    genders,
    jobDepartments,
    countries,
    ageRanges,
    salaryRanges,
    benefits,
  } = useLoaderData<typeof loader>()

  return (
    <>
      <Container className="mx-auto w-full">
        <Title className="pl-2 pt-5">Actualizar grupo de colaboradores</Title>

        <EmployeeGroupForm
          defaultValues={{
            name: employeeGroup.name,
            country: employeeGroup.country,
            state: employeeGroup.state,
            city: employeeGroup.city,
            gender: employeeGroup.gender,
            jobDepartment: employeeGroup.jobDepartment,
            ageRange: employeeGroup.ageRange,
            salaryRange: employeeGroup.salaryRange,
            benefits: employeeGroup.benefits,
          }}
          actions={
            <div className="mt-6 flex items-center justify-end gap-4">
              <Link
                to={`/dashboard/manage/employee-groups/${employeeGroup.id}`}
              >
                <ButtonElement
                  variant={ButtonColorVariants.SECONDARY}
                  className="sm:w-auto"
                >
                  Cancelar
                </ButtonElement>
              </Link>

              <SubmitButton className="w-full sm:w-auto">Guardar</SubmitButton>
            </div>
          }
          benefits={benefits}
          genders={genders}
          jobDepartments={jobDepartments}
          countries={countries}
          ageRanges={ageRanges}
          salaryRanges={salaryRanges}
        />
      </Container>
    </>
  )
}
