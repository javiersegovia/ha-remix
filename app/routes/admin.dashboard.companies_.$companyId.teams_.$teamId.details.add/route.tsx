import type {
  MetaFunction,
  LoaderArgs,
  ActionArgs,
} from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { badRequest } from 'remix-utils'
import { Form, useLoaderData } from '@remix-run/react'

import { addEmployeesToTeam, getTeamById } from '~/services/team/team.server'
import { requireAdminUserId } from '~/session.server'
import { $path } from 'remix-routes'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { Text } from '~/components/Typography/Text'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'
import { prisma } from '~/db.server'
import { Button, ButtonColorVariants } from '~/components/Button'
import { z } from 'zod'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear equipo | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId, teamId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
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
      message: 'No se ha encontrado el equipo',
      redirect: $path(`/admin/dashboard/companies/:companyId/teams`, {
        companyId,
      }),
    })
  }

  const employees = await prisma.employee.findMany({
    where: {
      AND: [
        {
          companyId,
        },
        {
          teamMembers: {
            every: {
              teamId: {
                not: {
                  equals: team.id,
                },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      companyId: true,
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

  return json({
    team,
    companyId,
    employees,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { companyId, teamId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: $path('/admin/dashboard/companies'),
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

  const redirectTo = $path(`/admin/dashboard/companies/:companyId/teams`, {
    companyId,
  })

  const formData = await request.formData()
  const employeesIds = formData.getAll('employeesIds')

  const result = z.array(z.string()).safeParse(employeesIds)

  if (!result.success) {
    throw badRequest({
      message: 'Ha ocurrido un error al añadir los colaboradores',
      redirect: redirectTo,
    })
  }

  await addEmployeesToTeam(result.data, teamId)

  return redirect(
    $path(`/admin/dashboard/companies/:companyId/teams/:teamId/details`, {
      companyId,
      teamId,
    })
  )
}

export default function AdminDashboardTeamAddEmployeesRoute() {
  const { companyId, team, employees } = useLoaderData<typeof loader>() || {}

  const onCloseRedirectTo = $path(
    `/admin/dashboard/companies/:companyId/teams/:teamId/details`,
    {
      companyId,
      teamId: team?.id,
    }
  )

  const formId = 'AddEmployeesToTeamForm'

  return (
    <AnimatedRightPanel
      title="Añadir colaboradores"
      onCloseRedirectTo={onCloseRedirectTo}
      actions={
        <div className="flex gap-5 pt-2">
          <Button
            href={onCloseRedirectTo}
            variant={ButtonColorVariants.SECONDARY}
          >
            Cancelar
          </Button>

          {employees?.length > 0 && (
            <Button
              type="submit"
              variant={ButtonColorVariants.PRIMARY}
              form={formId}
            >
              Añadir
            </Button>
          )}
        </div>
      }
    >
      {employees?.length > 0 ? (
        <>
          <Text className="mb-4 px-2 text-justify text-sm">
            Selecciona a los colaboradores que formarán parte de este grupo.{' '}
          </Text>

          <Form method="PUT" id={formId}>
            <DataTable columns={columns} data={employees} />
          </Form>
        </>
      ) : (
        <p className="px-2 text-justify">
          No se han encontrado colaboradores disponibles. Es posible que ya
          pertenezcan a este grupo o no coincidan con los filtros seleccionados.
        </p>
      )}
    </AnimatedRightPanel>
  )
}
