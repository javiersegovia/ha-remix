import { redirect, type ActionArgs, type LoaderArgs } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { ChallengeForm } from '~/components/Forms/ChallengeForm'
import { SubmitButton } from '~/components/SubmitButton'
import { challengeValidator } from '~/services/challenge/challenge.schema'
import { createChallenge } from '~/services/challenge/challenge.server'
import { requireEmployee } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireEmployee(request)
  return null
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
        <ChallengeForm formId="ChallengeForm" />
      </AnimatedRightPanel>
    </>
  )
}

export default HomeCreateChallengeRoute
