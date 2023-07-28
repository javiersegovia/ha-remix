import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { ChallengeForm } from '~/components/Forms/ChallengeForm'
import { SubmitButton } from '~/components/SubmitButton'
import {
  getChallengeById,
  updateChallengeById,
} from '~/services/challenge/challenge.server'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'
import { challengeValidator } from '~/services/challenge/challenge.schema'
import { parseISOLocalNullable } from '~/utils/formatDate'
import { useToastError } from '~/hooks/useToastError'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireEmployee(request)

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: '/home',
    })
  }

  const challenge = await getChallengeById(Number(challengeId))

  if (!challenge) {
    throw badRequest({
      message: 'No se encontró el reto',
      redirect: '/home',
    })
  }

  return json({ challenge })
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

  const formData = await request.formData()

  const { data, submittedData, error } = await challengeValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await updateChallengeById(data, Number(challengeId))

  return redirect('/home')
}

const HomeEditChallengeRoute = () => {
  const { challenge } = useLoaderData<typeof loader>() || {}
  const {
    title,
    description,
    goalDescription,
    measurerDescription,
    rewardDescription,
    startDate,
    finishDate,
  } = challenge || {}

  return (
    <>
      <AnimatedRightPanel
        title="Modificar reto"
        onCloseRedirectTo="/home"
        actions={
          <SubmitButton
            form="ChallengeForm"
            size="SM"
            className="ml-auto w-auto"
          >
            Guardar
          </SubmitButton>
        }
      >
        <ChallengeForm
          formId="ChallengeForm"
          defaultValues={{
            title,
            description,
            goalDescription,
            measurerDescription,
            rewardDescription,
            startDate: parseISOLocalNullable(startDate),
            finishDate: parseISOLocalNullable(finishDate),
          }}
        />
      </AnimatedRightPanel>
    </>
  )
}

export default HomeEditChallengeRoute

export const ErrorBoundary = () => {
  useToastError()
  return null
}
