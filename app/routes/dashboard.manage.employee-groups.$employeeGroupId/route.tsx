import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import type { EmployeeDataItem } from './table-columns'

import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'
import { redirect, json } from '@remix-run/node'
import { PermissionCode } from '@prisma/client'
import { $path } from 'remix-routes'
import { getSearchParams } from 'remix-params-helper'
import { MdOutlineModeEditOutline, MdOutlineDelete } from 'react-icons/md'

import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { badRequest } from '~/utils/responses'
import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import {
  deleteEmployeeGroupById,
  getEmployeeGroupById,
  removeEmployeesFromEmployeeGroup,
} from '~/services/employee-group/employee-group.server'
import { GoBack } from '~/components/Button/GoBack'
import { Button, ButtonIconVariants } from '~/components/Button'
import { FilterSummary } from '~/containers/dashboard/EmployeeGroup/FilterSummary'
import { calculateAge } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { columns } from './table-columns'
import { employeeTableSchema } from '~/services/employee/employee.schema'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { Box } from '~/components/Layout/Box'
import { HiOutlineUser } from 'react-icons/hi'
import { DataTable } from '~/components/Table/DataTable'
import { TableActions, deleteFormId } from './table-actions'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getAgeRanges } from '~/services/age-range/age-range.server'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { prisma } from '~/db.server'
import { searchSchema } from './search-schema'
import { buildEmployeeFilters } from '~/services/employee/employee.server'
import { getPaginationOptions } from '~/utils/getPaginationOptions'

const onCloseRedirectTo = '/dashboard/manage/employee-groups' as const

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Grupo de colaboradores no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { employeeGroup } = data

  return {
    title: `${employeeGroup?.name} | HoyTrabajas Beneficios`,
  }
}

export enum FormSubactions {
  DELETE_GROUP = 'DELETE_GROUP',
  REMOVE_EMPLOYEES = 'REMOVE_EMPLOYEES',
}

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
      redirect: onCloseRedirectTo,
    })
  }

  const searchResult = getSearchParams(request, searchSchema)

  if (!searchResult.success) {
    throw badRequest({
      message: 'Se ha recibido un formato de búsqueda incorrecto',
      redirect: null,
    })
  }

  const { keywords, jobDepartmentId, ageRangeId, salaryRangeId } =
    searchResult.data

  const employeeFilters = await buildEmployeeFilters({
    keywords,
    jobDepartmentId,
    ageRangeId,
    salaryRangeId,
    employeeGroupId,
    companyId: employee.companyId,
  })

  const employeeCount = await prisma.employee.count({
    where: {
      AND: employeeFilters,
    },
  })

  const { take, skip, pagination } = getPaginationOptions({
    request,
    itemsCount: employeeCount,
  })

  const getEmployees = () =>
    prisma.employee.findMany({
      where: {
        AND: employeeFilters,
      },
      take,
      skip,
      select: {
        id: true,
        status: true,
        salaryFiat: true,
        birthDay: true,
        gender: {
          select: {
            name: true,
          },
        },
        jobDepartment: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    })

  const [employees, employeeGroup, jobDepartments, salaryRanges, ageRanges] =
    await Promise.all([
      getEmployees(),
      getEmployeeGroupById(employeeGroupId),
      getJobDepartments(),
      getSalaryRanges(),
      getAgeRanges(),
    ])

  if (!employeeGroup) {
    throw badRequest({
      message: 'No se encontró el grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  const employeesData: EmployeeDataItem[] = employees?.map((e) => {
    return {
      id: e.id,
      email: e.user.email,
      fullName: `${e.user.firstName} ${e.user.lastName}`,
      status: e.status,
      age: (e.birthDay && calculateAge(e.birthDay)) || null,
      gender: e.gender?.name,
      jobDepartment: e.jobDepartment?.name,
      salary: e.salaryFiat
        ? formatMoney(e.salaryFiat, CurrencySymbol.COP)
        : null,
    }
  })

  return json({
    employeeGroup,
    employeesData,
    jobDepartments,
    salaryRanges,
    ageRanges,
    pagination,
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
  const subaction = formData.get('subaction')

  if (subaction === FormSubactions.REMOVE_EMPLOYEES) {
    const employeesIds = formData.getAll('employeesIds')

    const result = employeeTableSchema.safeParse(employeesIds)

    if (!result.success) {
      throw badRequest({
        message:
          'Ha ocurrido un error durante la eliminación de los colaboradores',
        redirect: onCloseRedirectTo,
      })
    }

    await removeEmployeesFromEmployeeGroup(result.data, employeeGroupId)

    return json(null, { status: 200 })
  } else if (subaction === FormSubactions.DELETE_GROUP) {
    await deleteEmployeeGroupById(employeeGroupId)
  }

  return redirect(onCloseRedirectTo)
}

const EmployeeGroupDetailsRoute = () => {
  const {
    employeeGroup,
    employeesData,
    jobDepartments,
    salaryRanges,
    ageRanges,
    pagination,
  } = useLoaderData<typeof loader>()

  const {
    country,
    state,
    city,
    gender,
    ageRange,
    salaryRange,
    benefits,
    jobDepartment,
  } = employeeGroup

  return (
    <>
      <Container className="my-10 w-full">
        <GoBack
          redirectTo="/dashboard/manage/employee-groups"
          description="Regresar"
        />
        <section className="flex flex-col items-center justify-between sm:flex-row">
          <Title className="text-steelBlue-800">{employeeGroup.name}</Title>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:mt-0 sm:flex-nowrap sm:justify-start">
            {employeeGroup._count.employees > 0 && (
              <Button
                href={$path(
                  '/dashboard/manage/employee-groups/:employeeGroupId/add',
                  {
                    employeeGroupId: employeeGroup.id,
                  }
                )}
                className=""
                icon={ButtonIconVariants.CREATE}
                size="XS"
              >
                Añadir colaboradores
              </Button>
            )}

            <Link
              to={$path(
                '/dashboard/manage/employee-groups/:employeeGroupId/update',
                {
                  employeeGroupId: employeeGroup.id,
                }
              )}
              className="flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800 sm:ml-auto"
            >
              <MdOutlineModeEditOutline className="text-2xl" />
            </Link>

            <Form method="DELETE">
              <input
                type="hidden"
                name="subaction"
                value={FormSubactions.DELETE_GROUP}
              />

              <button
                type="submit"
                className="flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
              >
                <MdOutlineDelete className="text-2xl" />
              </button>
            </Form>
          </div>
        </section>

        <div className="flex">
          <div className="inline-flex flex-grow-[0.1] items-stretch">
            <Box className="flex w-max flex-col items-center justify-center border border-steelBlue-100 p-1 text-steelBlue-800 sm:p-3">
              <span className="text-2xl">
                <HiOutlineUser className="inline-flex rounded-full bg-electricYellow-700 ring-8 ring-electricYellow-700"></HiOutlineUser>
                <div className="ml-5 inline-flex align-bottom text-4xl/7 font-bold">
                  {employeesData.length}
                </div>
              </span>
              <p className="pt-5">Colaboradores </p>
            </Box>
          </div>

          {(country || gender || ageRange || salaryRange || jobDepartment) && (
            <div className="mt-7">
              <FilterSummary
                country={country}
                state={state}
                city={city}
                gender={gender}
                ageRange={ageRange}
                salaryRange={salaryRange}
                jobDepartment={jobDepartment}
                options={{ hasColumns: true }}
              />
            </div>
          )}
        </div>

        <div />

        {benefits?.length > 0 ? (
          <div className="mt-4 items-center gap-6 p-5 md:inline-flex">
            <p className="mb-4 font-medium text-steelBlue-500 md:mb-0">
              Beneficios disponibles:
            </p>
            <div className="flex flex-wrap gap-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="rounded-3xl border border-steelBlue-200 bg-steelBlue-100 px-2 py-1"
                >
                  {benefit.name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4">Este grupo no posee beneficios disponibles.</p>
        )}

        {employeeGroup._count.employees > 0 ? (
          <>
            <DataTable
              columns={columns}
              data={employeesData}
              className="mt-4"
              pagination={pagination}
              tableActions={(table) => (
                <TableActions
                  table={table}
                  jobDepartments={jobDepartments}
                  salaryRanges={salaryRanges}
                  ageRanges={ageRanges}
                />
              )}
            />

            <Form method="DELETE" id={deleteFormId} />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún colaborador asociado a este grupo"
            description="¿Qué esperas para añadir a tus colaboradores?"
            actions={
              <Button
                href={$path(
                  '/dashboard/manage/employee-groups/:employeeGroupId/add',
                  {
                    employeeGroupId: employeeGroup.id,
                  }
                )}
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Añadir colaboradores
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>

      <Outlet />
    </>
  )
}

export default EmployeeGroupDetailsRoute
