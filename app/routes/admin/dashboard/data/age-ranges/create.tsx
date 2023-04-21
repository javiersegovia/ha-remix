import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { ageRangeValidator } from '~/services/age-range/age-range.schema'
import { createAgeRange } from '~/services/age-range/age-range.server'
import { redirect } from '@remix-run/server-runtime'
import { requireAdminUserId } from '~/session.server'
import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { AgeRangeForm } from '~/components/Forms/AgeRangeForm'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await ageRangeValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createAgeRange(data)

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = '/admin/dashboard/data/age-ranges' as const

export default function AgeRangeCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear rango de edad</Title>

        <AgeRangeForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
