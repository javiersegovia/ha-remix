import {
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from '@remix-run/server-runtime'

import { Form, useLoaderData } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { AnimatedModal } from '~/components/Animations/AnimatedModal'
import { SubmitButton } from '~/components/SubmitButton'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { badRequest } from '~/utils/responses'
import { $path } from 'remix-routes'
import { deleteTeamById } from '~/services/team/team.server'
import { json } from '@remix-run/node'

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

  return json({
    teamId,
    companyId,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  // todo: Validate that the user can update the challenge

  const { teamId, companyId } = params

  if (!teamId) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: '/home',
    })
  }

  if (!companyId) {
    throw badRequest({
      message: 'No se encontró el ID de la compañía',
      redirect: `/admin/dashboard/companies/`,
    })
  }

  await deleteTeamById(teamId)

  return redirect(
    $path('/admin/dashboard/companies/:companyId/teams', {
      companyId,
    })
  )
}

const HomeDeleteTeamRoute = () => {
  const { companyId, teamId } = useLoaderData<typeof loader>()

  return (
    <>
      <AnimatedModal
        onCloseRedirectTo={$path(
          '/admin/dashboard/companies/:companyId/teams/:teamId/details',
          {
            companyId,
            teamId,
          }
        )}
      >
        <div className="space-y-4 text-center">
          <Title>¿Estás seguro?</Title>

          <Text>
            Estás a punto de eliminar un equipo. Al eliminarlo, no podrás
            recuperar los datos.
          </Text>

          <Form method="DELETE">
            <SubmitButton variant={ButtonColorVariants.WARNING}>
              Eliminar
            </SubmitButton>

            <Button
              href={$path('/admin/dashboard/companies/:companyId/teams', {
                companyId,
              })}
              variant={ButtonColorVariants.SECONDARY}
              className="mt-4"
            >
              Cancelar
            </Button>
          </Form>
        </div>
      </AnimatedModal>
    </>
  )
}

export default HomeDeleteTeamRoute
