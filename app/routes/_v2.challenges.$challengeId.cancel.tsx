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
import { requireEmployeeCanViewChallenge } from '~/services/challenge/challenge.server'
import { $path } from 'remix-routes'
import { prisma } from '~/db.server'
import { ChallengeStatus } from '@prisma/client'

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

  await prisma.challenge.update({
    where: {
      id: Number(challengeId),
    },
    data: {
      status: ChallengeStatus.CANCELED,
    },
  })

  return redirect('/home')
}

const ChallengeCancelRoute = () => {
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
            Estás a punto de cancelar el reto. Al cancelarlo, no podrás volver a
            modificarlo y ninguna recompensa será entregada.
          </Text>

          <Form
            method="DELETE"
            className="grid grid-cols-2 items-center gap-4 pt-4"
          >
            <SubmitButton variant={ButtonColorVariants.WARNING} size="SM">
              Cancelar reto
            </SubmitButton>

            <Button
              href={onCloseRedirectTo}
              variant={ButtonColorVariants.SECONDARY}
              size="SM"
            >
              Regresar
            </Button>
          </Form>
        </div>
      </AnimatedModal>
    </>
  )
}

export default ChallengeCancelRoute
