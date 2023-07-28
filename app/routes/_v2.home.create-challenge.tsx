import {
  type ActionArgs,
  type LoaderArgs,
  redirect,
  json,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'

import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { ChallengeForm } from '~/components/Forms/ChallengeForm'
import { SubmitButton } from '~/components/SubmitButton'
import { challengeValidator } from '~/services/challenge/challenge.schema'
import { createChallenge } from '~/services/challenge/challenge.server'
import { getTeamsByCompanyId } from '~/services/team/team.server'
import { requireEmployee } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const teams = await getTeamsByCompanyId(employee.companyId)

  return json({
    teams,
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

const HomeCreateChallengeRoute = () => {
  const { teams } = useLoaderData<typeof loader>() || {}

  return (
    <>
      <AnimatedRightPanel
        title="Crear reto"
        onCloseRedirectTo="/home"
        actions={
          <SubmitButton
            form="ChallengeForm"
            size="SM"
            className="ml-auto md:w-auto"
          >
            Guardar
          </SubmitButton>
        }
      >
        <ChallengeForm formId="ChallengeForm" teams={teams} />
      </AnimatedRightPanel>
    </>
  )
}

export default HomeCreateChallengeRoute
