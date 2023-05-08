import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { json } from '@remix-run/node'
import { PermissionCode } from '@prisma/client'

import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { employeeGroupValidator } from '~/services/employee-group/employee-group.schema'
import { createEmployeeGroup } from '~/services/employee-group/employee-group.server'
import { EmployeeGroupForm } from '~/components/Forms/EmployeeGroupForm'
import { Link, useLoaderData } from '@remix-run/react'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { getGenders } from '~/services/gender/gender.server'
import { getCountries } from '~/services/country/country.server'
import { getAgeRanges } from '~/services/age-range/age-range.server'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { Container } from '~/components/Layout/Container'

export const meta: MetaFunction = () => {
  return {
    title: 'Crear grupo de colaboradores | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const [
    benefits,
    countries,
    genders,
    jobDepartments,
    ageRanges,
    salaryRanges,
  ] = await Promise.all([
    getAvailableBenefitsByCompanyId(employee.companyId),
    getCountries(),
    getGenders(),
    getJobDepartments(),
    getAgeRanges(),
    getSalaryRanges(),
  ])

  return json({
    benefits,
    countries,
    genders,
    jobDepartments,
    ageRanges,
    salaryRanges,
  })
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
  const {
    benefits,
    genders,
    jobDepartments,
    countries,
    ageRanges,
    salaryRanges,
  } = useLoaderData<typeof loader>()

  return (
    <>
      <Container className="mx-auto w-full">
        <Title className="pt-5 pl-2">Crear grupo</Title>
        <EmployeeGroupForm
          actions={
            <div className="mt-6 flex items-center justify-end gap-4">
              <Link to="/dashboard/manage/employee-groups">
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
