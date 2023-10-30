import { type LoaderArgs, json } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import {
  getChallengeById,
  requireEmployeeCanViewChallenge,
} from '~/services/challenge/challenge.server'
import { $path } from 'remix-routes'

import { AnimatedModal } from '~/components/Animations/AnimatedModal'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: $path('/home'),
    })
  }

  await requireEmployeeCanViewChallenge(Number(challengeId), employee.id)

  const challenge = await getChallengeById(Number(challengeId))

  if (!challenge) {
    throw badRequest({
      message: 'No se encontró el reto',
      redirect: $path('/home'),
    })
  }

  return json({
    challenge,
  })
}

const ChallengeCompleteRoute = () => {
  const { challenge } = useLoaderData<typeof loader>()

  const onCloseRedirectTo = $path('/challenges/:challengeId', {
    challengeId: challenge.id,
  })

  return (
    <>
      <AnimatedModal onCloseRedirectTo={onCloseRedirectTo}>
        <div className="space-y-4">
          <Title className="text-center">¡Recompensas entregadas!</Title>

          <Text className="text-sm">
            Los colaboradores recibieron los puntos correspondientes, y el reto
            ha sido finalizado.
          </Text>

          <Button
            href={onCloseRedirectTo}
            variant={ButtonColorVariants.PRIMARY}
            size="SM"
            className="mt-10"
          >
            Regresar
          </Button>
        </div>
      </AnimatedModal>
    </>
  )
}

export default ChallengeCompleteRoute
