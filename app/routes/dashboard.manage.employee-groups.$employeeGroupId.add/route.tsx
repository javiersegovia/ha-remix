import type { Prisma } from '@prisma/client'
import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { Form, useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'

import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { FilterSummary } from '~/containers/dashboard/EmployeeGroup/FilterSummary'
import {
  addEmployeesToEmployeeGroup,
  getEmployeeGroupById,
} from '~/services/employee-group/employee-group.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import { columns } from './table-columns'
import { prisma } from '~/db.server'
import { getMinDateFromAge } from '~/utils/formatDate'
import { Button, ButtonColorVariants } from '~/components/Button'
import { employeeTableSchema } from '~/services/employee/employee.schema'
import { DataTable } from '~/components/Table/DataTable'

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
      redirect: '/dashboard/manage/employee-groups',
    })
  }

  const employeeGroup = await getEmployeeGroupById(employeeGroupId)

  if (!employeeGroup) {
    throw badRequest({
      message: 'No se encontró el grupo de colaboradores',
      redirect: '/dashboard/manage/employee-groups',
    })
  }

  const filters: Prisma.Enumerable<Prisma.EmployeeWhereInput> = [
    {
      companyId: employee.companyId,
    },
    {
      employeeGroups: {
        every: {
          id: {
            not: {
              equals: employeeGroup.id,
            },
          },
        },
      },
    },
  ]

  const { ageRange, city, country, gender, jobDepartment, salaryRange, state } =
    employeeGroup

  if (ageRange) {
    filters.push({
      birthDay: {
        lte: getMinDateFromAge(ageRange?.minAge),
        gte: ageRange?.maxAge
          ? getMinDateFromAge(ageRange?.maxAge + 1)
          : undefined,
      },
    })
  }

  if (salaryRange) {
    filters.push({
      salaryFiat: {
        lte: salaryRange.maxValue ? salaryRange.maxValue : undefined,
        gte: salaryRange.minValue,
      },
    })
  }

  if (gender) {
    filters.push({
      genderId: gender.id,
    })
  }

  if (jobDepartment) {
    filters.push({
      jobDepartmentId: jobDepartment.id,
    })
  }

  if (city) {
    filters.push({
      cityId: city.id,
    })
  }

  if (state) {
    filters.push({
      stateId: state.id,
    })
  }

  if (country) {
    filters.push({
      countryId: country.id,
    })
  }

  const employees = await prisma.employee.findMany({
    where: {
      AND: filters,
    },
    select: {
      id: true,
      birthDay: true,
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  })

  return json({ employeeGroup, employees })
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
      redirect: $path('/dashboard/manage/employee-groups'),
    })
  }

  const redirectTo = $path(
    `/dashboard/manage/employee-groups/:employeeGroupId`,
    { employeeGroupId: employeeGroupId }
  )

  const formData = await request.formData()
  const employeesIds = formData.getAll('employeesIds')

  const result = employeeTableSchema.safeParse(employeesIds)

  if (!result.success) {
    throw badRequest({
      message: 'Ha ocurrido un error al añadir los colaboradores',
      redirect: redirectTo,
    })
  }

  await addEmployeesToEmployeeGroup(result.data, employeeGroupId)

  return redirect(redirectTo)
}

export default function CreateEmployeeGroupRoute() {
  const { employeeGroup, employees } = useLoaderData<typeof loader>()

  const {
    country,
    state,
    city,
    gender,
    ageRange,
    salaryRange,
    jobDepartment,
    id,
  } = employeeGroup

  const onCloseRedirectTo = $path(
    `/dashboard/manage/employee-groups/:employeeGroupId`,
    { employeeGroupId: id }
  )

  const hasFilters =
    country || gender || ageRange || salaryRange || jobDepartment

  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <Form method="PUT">
          <RightPanel
            onCloseRedirectTo={onCloseRedirectTo}
            title="Colaboradores disponibles"
          >
            {hasFilters && (
              <FilterSummary
                country={country}
                state={state}
                city={city}
                gender={gender}
                ageRange={ageRange}
                salaryRange={salaryRange}
                jobDepartment={jobDepartment}
                className="text-sm"
                options={{ hasColumns: false }}
              />
            )}

            {employees.length > 0 ? (
              <>
                <p className="px-2 text-justify text-sm">
                  Selecciona a los colaboradores que formarán parte de este
                  grupo.{' '}
                  {hasFilters && (
                    <>
                      Ten en cuenta que los resultados toman en cuenta los
                      filtros seleccionados.
                    </>
                  )}
                </p>
                <div className="overflow-y-auto">
                  <DataTable columns={columns} data={employees} />
                </div>
              </>
            ) : (
              <p className="px-2 text-justify">
                No se han encontrado colaboradores disponibles. Es posible que
                ya pertenezcan a este grupo o no coincidan con los filtros
                seleccionados.
              </p>
            )}

            <div className="flex gap-5 pt-2">
              <Button
                href={onCloseRedirectTo}
                variant={ButtonColorVariants.SECONDARY}
              >
                Cancelar
              </Button>
              {employees.length > 0 && (
                <Button type="submit" variant={ButtonColorVariants.PRIMARY}>
                  Añadir
                </Button>
              )}
            </div>
          </RightPanel>
        </Form>
      </Modal>
    </>
  )
}
