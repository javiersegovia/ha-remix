import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { Form, Link } from '@remix-run/react'
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
    <Container className="my-10 w-full">
      <GoBack
        redirectTo="/dashboard/manage/employee-groups"
        description="Regresar"
      />
      <section className="mb-7 flex items-center justify-between">
        <Title className="text-steelBlue-800">{employeeGroup.name}</Title>

        <div className="flex items-center gap-4">
          <Link
            to="update"
            className="ml-auto flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
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
        <Box className="items-center gap-6 p-5 md:inline-flex">
          <p className="mb-4 font-medium text-steelBlue-500 md:mb-0">
            Filtros del grupo:
          </p>

          <ul className="ml-3 grid list-disc pl-3 sm:grid-cols-2 md:ml-0">
            {country && (
              <li>
                <span className="relative -left-2 font-medium">País:</span>{' '}
                {country.name}
              </li>
            )}

            {state && (
              <li>
                <span className="relative -left-2 font-medium">Estado:</span>{' '}
                {state.name}
              </li>
            )}

            {city && (
              <li>
                <span className="relative -left-2 font-medium">Ciudad:</span>{' '}
                {city.name}
              </li>
            )}

            {gender && (
              <li>
                <span className="relative -left-2 font-medium">Género:</span>{' '}
                {gender.name}
              </li>
            )}
            {ageRange && (
              <li>
                <span className="relative -left-2 font-medium">Edad:</span>{' '}
                {formatAgeRange(ageRange.minAge, ageRange.maxAge)}
              </li>
            )}
            {salaryRange && (
              <li>
                <span className="relative -left-2 font-medium">Salario:</span>{' '}
                {formatSalaryRange({
                  minValue: salaryRange.minValue,
                  maxValue: salaryRange.maxValue,
                })}
              </li>
            )}
          </ul>
        </Box>
      )}

      <div />

      {benefits?.length > 0 ? (
        <div className="items-center gap-6 p-5 md:inline-flex">
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

      <div className="h-full overflow-y-auto overflow-x-hidden pr-4 text-sm"></div>
    </Container>
  )
}

export default EmployeeGroupDetailsRoute
