import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { IdentityDocumentTypeForm } from '~/components/Forms/IdentityDocumentTypeForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { identityDocumentTypeValidator } from '~/services/identity-document-type/identity-document-type.schema'
import { createIdentityDocumentType } from '~/services/identity-document-type/identity-document-type.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()
  const { data, submittedData, error } =
    await identityDocumentTypeValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createIdentityDocumentType(data)

  return redirect('/admin/dashboard/data/identity-document-types')
}

const onCloseRedirectTo =
  '/admin/dashboard/data/identity-document-types' as const

export default function IdentityDocumentTypesCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear tipos de documento de identidad</Title>

        <IdentityDocumentTypeForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
