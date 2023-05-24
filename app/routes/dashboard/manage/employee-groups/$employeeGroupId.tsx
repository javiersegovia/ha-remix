import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { Form, Link, Outlet } from '@remix-run/react'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { PermissionCode } from '@prisma/client'
import { MdOutlineModeEditOutline, MdOutlineDelete } from 'react-icons/md'

import { Container } from '~/components/Layout/Container'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { badRequest } from '~/utils/responses'
import { requireEmployee } from '~/session.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import {
  deleteEmployeeGroupById,
  getEmployeeGroupById,
} from '~/services/employee-group/employee-group.server'
import { formatAgeRange } from '~/utils/formatAgeRange'
import { formatSalaryRange } from '~/utils/formatSalaryRange'
import { GoBack } from '~/components/Button/GoBack'
import { Button, ButtonIconVariants } from '~/components/Button'
import { FilterSummary } from '~/containers/dashboard/EmployeeGroup/FilterSummary'

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

  return json({ employeeGroup })
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

  await deleteEmployeeGroupById(employeeGroupId)

  return redirect(onCloseRedirectTo)
}

const EmployeeGroupDetailsRoute = () => {
  const { employeeGroup } = useLoaderData<typeof loader>()
  const { country, state, city, gender, ageRange, salaryRange, benefits } =
    employeeGroup

  return (
    <>
      <Container className="my-10 w-full">
        <GoBack
          redirectTo="/dashboard/manage/employee-groups"
          description="Regresar"
        />
        <section className="mb-7 flex flex-col sm:flex-row items-center justify-between">
          <Title className="text-steelBlue-800">{employeeGroup.name}</Title>
          <div className="flex mt-4 sm:mt-0 justify-center sm:justify-start flex-wrap sm:flex-nowrap items-center gap-4">
            <Button
              href="add"
              className=""
              icon={ButtonIconVariants.CREATE}
              size="XS"
            >
              Añadir colaboradores
            </Button>

            <Link
              to="update"
              className="sm:ml-auto flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
            >
              <MdOutlineModeEditOutline className="text-2xl" />
            </Link>

            <Form method="delete">
              <button
                type="submit"
                className="flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
              >
                <MdOutlineDelete className="text-2xl" />
              </button>
            </Form>
          </div>
        </section>

        {(country || gender || ageRange || salaryRange) && (
          <FilterSummary 
            country={country}
            state={state}
            city={city}
            gender={gender}
            ageRange={ageRange}
            salaryRange={salaryRange}
            options={{ hasColumns: true }}
          />
        )}

        <div />

        {benefits?.length > 0 ? (
          <div className="items-center gap-6 p-5 mt-10 md:inline-flex">
            <p className="mb-4 font-medium text-steelBlue-500 md:mb-0">
              Beneficios disponibles:
            </p>
            <div className="flex flex-wrap gap-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="rounded-3xl border border-steelBlue-200 bg-steelBlue-100 py-1 px-2"
                >
                  {benefit.name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Este grupo no posee beneficios disponibles.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}

export default EmployeeGroupDetailsRoute
