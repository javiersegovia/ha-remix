import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { ChallengeForm } from '~/components/Forms/ChallengeForm'
import { SubmitButton } from '~/components/SubmitButton'
import {
  getChallengeById,
  requireEmployeeCanViewChallenge,
  updateChallengeById,
} from '~/services/challenge/challenge.server'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import { challengeValidator } from '~/services/challenge/challenge.schema'
import { parseISOLocalNullable } from '~/utils/formatDate'
import { useToastError } from '~/hooks/useToastError'
import { getTeamsByCompanyId } from '../services/team/team.server'
import { getIndicators } from '~/services/indicator/indicator.server'
import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { Button, ButtonColorVariants } from '~/components/Button'
import { $path } from 'remix-routes'

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

  const teams = await getTeamsByCompanyId(employee.companyId)
  const indicators = await getIndicators()

  return json({ challenge, teams, indicators })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: $path('/home'),
    })
  }

  await requireEmployeeCanViewChallenge(Number(challengeId), employee.id)

  const formData = await request.formData()

  const { data, submittedData, error } = await challengeValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  const challenge = await updateChallengeById(data, Number(challengeId))

  return redirect(
    $path('/challenges/:challengeId', { challengeId: challenge.id })
  )
}

const ChallengeUpdateRoute = () => {
  const { challenge, teams, indicators } = useLoaderData<typeof loader>() || {}
  const {
    id,
    title,
    description,
    goal,
    status,
    reward,
    rewardEligibles,
    startDate,
    finishDate,
    indicatorId,
    teams: currentTeams,
  } = challenge || {}

  const formId = 'UpdateChallengeForm'

  return (
    <>
      <Container>
        <Title className="mb-10">Modificar reto</Title>

        <ChallengeForm
          teams={teams}
          indicators={indicators}
          formId={formId}
          defaultValues={{
            title,
            description,
            goal,
            status,
            reward,
            rewardEligibles,
            startDate: parseISOLocalNullable(startDate),
            finishDate: parseISOLocalNullable(finishDate),
            teams: currentTeams,
            indicatorId,
          }}
        />

        <section className="mt-10 flex justify-end gap-4">
          <Button
            href={$path('/challenges/:challengeId', {
              challengeId: id,
            })}
            variant={ButtonColorVariants.WARNING}
            className="md:w-auto"
          >
            Cancelar
          </Button>

          <SubmitButton form={formId} size="SM" className="md:w-auto">
            Guardar
          </SubmitButton>
        </section>
      </Container>
    </>
  )
}

export default ChallengeUpdateRoute

export const ErrorBoundary = () => {
  useToastError()
  return null
}
