import {
  redirect,
  type ActionArgs,
  type LoaderArgs,
  json,
} from '@remix-run/server-runtime'

import { Form, useLoaderData } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import {
  getChallengeById,
  requireEmployeeCanViewChallenge,
} from '~/services/challenge/challenge.server'
import { $path } from 'remix-routes'
import {
  getEmployeeIndicatorActivities,
  getIndicatorActivitiesByChallengeId,
} from '~/services/indicator-activity/indicator-activity.server'
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

  const challengeIndicatorActivities = challenge.indicator
    ? await getIndicatorActivitiesByChallengeId(Number(challengeId))
    : []

  const employeesIActivities = challenge?.goal
    ? getEmployeeIndicatorActivities({
        indicatorActivities: challengeIndicatorActivities,
        goal: challenge.goal,
      })
    : []

  return json({
    challenge,
    employeesIActivities: employeesIActivities.splice(
      0,
      challenge.rewardEligibles
    ),
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

  const challenge = await getChallengeById(Number(challengeId))

  if (!challenge) {
    throw badRequest({
      message: 'No se encontró el reto',
      redirect: $path('/home'),
    })
  }

  return redirect(
    $path('/challenges/:challengeId/complete-success', {
      challengeId: challenge.id,
    })
  )
}

const ChallengeCompleteRoute = () => {
  const { challenge, employeesIActivities } = useLoaderData<typeof loader>()

  const { reward, rewardEligibles = 1 } = challenge

  const onCloseRedirectTo = $path('/challenges/:challengeId', {
    challengeId: challenge.id,
  })

  return (
    <>
      <AnimatedModal onCloseRedirectTo={onCloseRedirectTo}>
        <div className="space-y-4">
          <Title className="text-center">Entrega de recompensas</Title>

          <Text className="text-sm">
            Estás a punto de entregar las recompensas del reto. Por favor,
            verifica bien la actividad de los colaboradores antes de realizar
            esta acción.
          </Text>

          <Text className="text-sm">
            Los colaboradores elegibles para recompensa son:
          </Text>

          {employeesIActivities?.length > 0 && (
            <section className="mt-10">
              <ul className="text-left text-sm">
                {employeesIActivities.map((item, index) => {
                  return (
                    <li key={item.employeeId}>
                      <span>{index + 1}. </span>
                      {item.fullName}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <Text className="text-sm">
            {reward && (
              <p>
                Puntos a entregar:{' '}
                <span>
                  {rewardEligibles > 1
                    ? `${rewardEligibles * reward} (${reward} c/u)`
                    : reward}
                </span>
              </p>
            )}
          </Text>

          <Form
            method="POST"
            className="grid grid-cols-2 items-center gap-4 pt-4"
          >
            <SubmitButton size="SM">Confirmar</SubmitButton>

            <Button
              href={onCloseRedirectTo}
              variant={ButtonColorVariants.SECONDARY}
              size="SM"
            >
              Cancelar
            </Button>
          </Form>
        </div>
      </AnimatedModal>
    </>
  )
}

export default ChallengeCompleteRoute
