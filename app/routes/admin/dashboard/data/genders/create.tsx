import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { GenderForm } from '~/components/Forms/GenderForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { genderValidator } from '~/services/gender/gender.schema'
import { createGender } from '~/services/gender/gender.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await genderValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createGender(data)

  return redirect('/admin/dashboard/data/genders')
}

const onCloseRedirectTo = '/admin/dashboard/data/genders' as const

export default function GenderCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear género</Title>

        <GenderForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
