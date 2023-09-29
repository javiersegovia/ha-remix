import {
  redirect,
  type ActionArgs,
  type LoaderArgs,
  json,
} from '@remix-run/server-runtime'

import { Form, useLoaderData } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { AnimatedModal } from '~/components/Animations/AnimatedModal'
import { SubmitButton } from '~/components/SubmitButton'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import {
  deleteChallengeById,
  requireEmployeeCanViewChallenge,
} from '~/services/challenge/challenge.server'
import { $path } from 'remix-routes'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireEmployee(request)

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: $path('/home'),
    })
  }

  return json({
    challengeId,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: '/home',
    })
  }

  await requireEmployeeCanViewChallenge(Number(challengeId), employee.id)

  await deleteChallengeById(Number(challengeId))

  return redirect('/home')
}

const ChallengeDeleteRoute = () => {
  const { challengeId } = useLoaderData<typeof loader>()

  const onCloseRedirectTo = $path('/challenges/:challengeId', {
    challengeId,
  })

  return (
    <>
      <AnimatedModal onCloseRedirectTo={onCloseRedirectTo}>
        <div className="space-y-4 text-center">
          <Title>¿Estás seguro?</Title>

          <Text>
            Estás a punto de eliminar un reto. Al eliminarlo, no podrás
            recuperar los datos.
          </Text>

          <Form method="DELETE">
            <SubmitButton variant={ButtonColorVariants.WARNING}>
              Eliminar
            </SubmitButton>

            <Button
              href={onCloseRedirectTo}
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

export default ChallengeDeleteRoute
