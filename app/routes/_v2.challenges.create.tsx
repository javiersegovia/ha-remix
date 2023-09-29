import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/server-runtime'
import { requireEmployee } from '~/session.server'
import { getTeamsByCompanyId } from '~/services/team/team.server'
import { getIndicators } from '~/services/indicator/indicator.server'
import { challengeValidator } from '~/services/challenge/challenge.schema'
import { validationError } from 'remix-validated-form'
import { createChallenge } from '~/services/challenge/challenge.server'
import { useLoaderData } from '@remix-run/react'
import { ChallengeForm } from '~/components/Forms/ChallengeForm'
import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { SubmitButton } from '~/components/SubmitButton'
import { Button, ButtonColorVariants } from '~/components/Button'
import { $path } from 'remix-routes'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const teams = await getTeamsByCompanyId(employee.companyId)
  const indicators = await getIndicators()

  return json({
    teams,
    indicators,
  })
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await challengeValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createChallenge(data, employee.companyId)

  return redirect('/home')
}

const ChallengeCreateRoute = () => {
  const { teams, indicators } = useLoaderData<typeof loader>() || {}
  const formId = 'ChallengeForm'

  return (
    <Container>
      <Title className="mb-10">Crear reto</Title>

      <ChallengeForm formId={formId} teams={teams} indicators={indicators} />

      <section className="mt-10 flex justify-end gap-4">
        <Button
          href={$path('/home')}
          variant={ButtonColorVariants.WARNING}
          className="ml-auto md:w-auto"
        >
          Cancelar
        </Button>

        <SubmitButton form={formId} size="SM" className="md:w-auto">
          Guardar
        </SubmitButton>
      </section>
    </Container>
  )
}

export default ChallengeCreateRoute
