import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { redirect, json } from '@remix-run/node'
import { MdOutlineDelete, MdOutlineModeEditOutline } from 'react-icons/md'
import { $path } from 'remix-routes'
import { Button, ButtonIconVariants } from '~/components/Button'
import { GoBack } from '~/components/Button/GoBack'

import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'

import { badRequest } from '~/utils/responses'
import { deleteTeamById, getTeamById } from '~/services/team/team.server'
import { employeeTableSchema } from '~/services/employee/employee.schema'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { teamId } = params

  console.log(teamId)

  if (!teamId) {
    throw badRequest({
      message: 'No se encontró el ID del equipo',
      redirect: `/admin/dashboard/companies/`,
    })
  }
  const team = await getTeamById(teamId)

  if (!team) {
    throw badRequest({
      message: 'No se encontró el equipo',
      redirect: `/admin/dashboard/companies/`,
    })
  }
  return json({ team })
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

export enum FormSubactions {
  DELETE_GROUP = 'DELETE_GROUP',
  REMOVE_EMPLOYEES = 'REMOVE_EMPLOYEES',
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { teamId } = params
  if (!teamId) {
    throw badRequest({
      message: 'No se encontró el ID del equipo',
      redirect: `/admin/dashboard/companies`,
    })
  }

  const formData = await request.formData()
  const subaction = formData.get('subaction')

  if (subaction === FormSubactions.REMOVE_EMPLOYEES) {
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
  } else if (subaction === FormSubactions.DELETE_GROUP) {
    await deleteTeamById(teamId)
  }

  return redirect(`/admin/dashboard/companies`)
}

export default function TeamDetailsIndexRoute() {
  const { team } = useLoaderData<typeof loader>()
  return (
    <Container className="my-10 w-full">
      <GoBack
        redirectTo={`/admin/dashboard/companies/${employee.companyId}/teams`}
        description="Regresar"
      />
      <section className="flex flex-col items-center justify-between sm:flex-row">
        <Title className="text-steelBlue-800">{team.name}</Title>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:mt-0 sm:flex-nowrap sm:justify-start">
          {team._count.members > 0 && (
            <Button
              href={$path(
                `/admin/dashboard/companies/${employee.companyId}/teams`,
                {
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

          <Link
            to={$path(
              `/admin/dashboard/companies/${employee.companyId}/teams`,
              {
                teamId: team.id,
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
    </Container>
  )
}
