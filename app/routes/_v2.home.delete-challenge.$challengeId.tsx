import {
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from '@remix-run/server-runtime'

import { Form } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { AnimatedModal } from '~/components/Animations/AnimatedModal'
import { SubmitButton } from '~/components/SubmitButton'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import { deleteChallengeById } from '~/services/challenge/challenge.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireEmployee(request)
  return null
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireEmployee(request)

  // todo: Validate that the user can update the challenge

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: '/home',
    })
  }

  await deleteChallengeById(Number(challengeId))

  return redirect('/home')
}

const HomeDeleteChallengeRoute = () => {
  return (
    <>
      <AnimatedModal onCloseRedirectTo="/home">
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
              href="/home"
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

export default HomeDeleteChallengeRoute
