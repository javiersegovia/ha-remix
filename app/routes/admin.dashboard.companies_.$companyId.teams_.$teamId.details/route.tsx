import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import type { EmployeeDataItem } from './table-columns'

import { Form, useLoaderData, useOutlet } from '@remix-run/react'
import { json } from '@remix-run/node'
import { $path } from 'remix-routes'
import { Button, ButtonIconVariants } from '~/components/Button'
import { GoBack } from '~/components/Button/GoBack'

import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'

import { badRequest } from '~/utils/responses'
import {
  getTeamById,
  removeEmployeesFromTeam,
} from '~/services/team/team.server'
import { employeeTableSchema } from '~/services/employee/employee.schema'
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
import { AnimatePresence } from 'framer-motion'
import { MenuButton } from '~/components/Button/MenuButton'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { TableActions, deleteFormId } from './table-actions'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'
import { calculateAge } from '~/utils/formatDate'
import { getSearchParams } from 'remix-params-helper'
import { employeeSearchSchema } from '~/services/employee/employee-search.schema'
import { buildEmployeeFilters } from '~/services/employee/employee.server'
import { prisma } from '~/db.server'
import { getPaginationOptions } from '~/utils/getPaginationOptions'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { getAgeRanges } from '~/services/age-range/age-range.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { teamId, companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se encontró el ID de la compañía',
      redirect: `/admin/dashboard/companies/`,
    })
  }

  if (!teamId) {
    throw badRequest({
      message: 'No se encontró el ID del equipo',
      redirect: $path(`/admin/dashboard/companies/:companyId/teams`, {
        companyId,
      }),
    })
  }

  const team = await getTeamById(teamId)

  if (!team) {
    throw badRequest({
      message: 'No se encontró el equipo',
      redirect: $path(`/admin/dashboard/companies/:companyId/teams`, {
        companyId,
      }),
    })
  }

  const searchResult = getSearchParams(request, employeeSearchSchema)

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
    companyId,
    teamId,
  })

  const totalEmployeesCount = await prisma.employee.count({
    where: {
      AND: await buildEmployeeFilters({
        companyId,
        teamId,
      }),
    },
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

  const [employees, jobDepartments, salaryRanges, ageRanges] =
    await Promise.all([
      getEmployees(),
      getJobDepartments(),
      getSalaryRanges(),
      getAgeRanges(),
    ])

  const employeesData: EmployeeDataItem[] = employees?.map((e) => {
    return {
      id: e.id,
      email: e.user.email,
      fullName: `${e.user.firstName} ${e.user.lastName}`,
      status: e.status,
      age: (e.birthDay && calculateAge(e.birthDay)) || null,
      gender: e.gender?.name,
      jobDepartment: e.jobDepartment?.name,
      companyId,
    }
  })

  return json({
    team,
    companyId,
    employeesData,
    pagination,
    jobDepartments,
    salaryRanges,
    ageRanges,
    totalEmployeesCount,
  })
}
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Equipo no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { team } = data

  return {
    title: `[Admin] ${team?.name} | HoyTrabajas Beneficios`,
  }
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { teamId, companyId } = params

  if (!teamId) {
    throw badRequest({
      message: 'No se encontró el ID del equipo',
      redirect: `/admin/dashboard/companies`,
    })
  }

  if (!companyId) {
    throw badRequest({
      message: 'No se encontró el ID de la compañía',
      redirect: `/admin/dashboard/companies/`,
    })
  }

  const formData = await request.formData()

  const employeesIds = formData.getAll('employeesIds')

  const result = employeeTableSchema.safeParse(employeesIds)

  if (!result.success) {
    throw badRequest({
      message: 'Ha ocurrido un error durante la eliminación de los equipos',
      redirect: '',
    })
  }

  await removeEmployeesFromTeam(result.data, teamId)

  return json(null, { status: 200 })
}

export default function TeamDetailsIndexRoute() {
  const {
    team,
    companyId,
    employeesData,
    pagination,
    jobDepartments,
    salaryRanges,
    ageRanges,
    totalEmployeesCount,
  } = useLoaderData<typeof loader>()

  const outlet = useOutlet()

  const navigation = [
    {
      name: 'Editar',
      href: $path(
        '/admin/dashboard/companies/:companyId/teams/:teamId/update',
        { companyId, teamId: team.id }
      ),
      preventScrollReset: true,
      Icon: HiOutlinePencilSquare,
    },
    {
      name: 'Eliminar',
      href: $path(
        '/admin/dashboard/companies/:companyId/teams/:teamId/details/delete',
        { companyId, teamId: team.id }
      ),
      preventScrollReset: true,
      Icon: HiOutlineTrash,
    },
  ]

  return (
    <>
      <Container className="my-10 w-full">
        <GoBack
          redirectTo={$path(`/admin/dashboard/companies/:companyId/teams`, {
            companyId,
          })}
          description="Regresar"
        />
        <section className="flex flex-col items-center justify-between sm:flex-row">
          <Title className="text-steelBlue-800">{team.name}</Title>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:mt-0 sm:flex-nowrap sm:justify-start">
            {team._count.members > 0 && (
              <Button
                href={$path(
                  `/admin/dashboard/companies/:companyId/teams/:teamId/details/add`,
                  {
                    companyId,
                    teamId: team.id,
                  }
                )}
                className=""
                icon={ButtonIconVariants.CREATE}
                size="XS"
              >
                Añadir colaboradores
              </Button>
            )}

            <MenuButton navigation={navigation} />
          </div>
        </section>

        {team._count.members > 0 ? (
          <>
            <Title as="h4" className="mt-10">
              Miembros ({totalEmployeesCount})
            </Title>

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
            title="Aún no tienes ningún colaborador dentro del equipo"
            description="¿Qué esperas para añadir un colaborador?"
            actions={
              <Button
                href={$path(
                  '/admin/dashboard/companies/:companyId/teams/:teamId/details/add',
                  { companyId, teamId: team.id }
                )}
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Añadir colaborador
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}
