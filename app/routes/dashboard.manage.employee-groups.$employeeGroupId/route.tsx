import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'

import { Form, Link, Outlet } from '@remix-run/react'
import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { PermissionCode } from '@prisma/client'
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

import { EmployeesTable } from './EmployeesTable'
import type { EmployeeDataItem } from './table-columns'
import { columns } from './table-columns'
import { employeeTableSchema } from '~/services/employee/employee.schema'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { $path } from 'remix-routes'

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

  const employeeGroup = await getEmployeeGroupById(employeeGroupId)

  if (!employeeGroup) {
    throw badRequest({
      message: 'No se encontró el grupo de colaboradores',
      redirect: onCloseRedirectTo,
    })
  }

  const employeesData: EmployeeDataItem[] = employeeGroup.employees.map((e) => {
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

  return json({ employeeGroup, employeesData })
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
  const { employeeGroup, employeesData } = useLoaderData<typeof loader>()
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
        <section className="mb-7 flex flex-col items-center justify-between sm:flex-row">
          <Title className="text-steelBlue-800">{employeeGroup.name}</Title>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:mt-0 sm:flex-nowrap sm:justify-start">
            {employeesData.length > 0 && (
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

        {(country || gender || ageRange || salaryRange || jobDepartment) && (
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
        )}

        <div />

        {benefits?.length > 0 ? (
          <div className="mt-10 items-center gap-6 p-5 md:inline-flex">
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
          <p>Este grupo no posee beneficios disponibles.</p>
        )}

        {employeesData.length > 0 ? (
          <EmployeesTable
            columns={columns}
            data={employeesData}
            className="mt-4"
          />
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
