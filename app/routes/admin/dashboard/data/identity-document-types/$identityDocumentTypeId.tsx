import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { Modal } from '~/components/Dialog/Modal'
import { IdentityDocumentTypeForm } from '~/components/Forms/IdentityDocumentTypeForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { identityDocumentTypeValidator } from '~/services/identity-document-type/identity-document-type.schema'
import {
  deleteIdentityDocumentTypeById,
  updateIdentityDocumentTypeById,
  getIdentityDocumentTypeById,
} from '~/services/identity-document-type/identity-document-type.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { identityDocumentTypeId } = params

  if (!identityDocumentTypeId || isNaN(Number(identityDocumentTypeId))) {
    throw badRequest({
      message: 'No se encontró el ID del tipo de documento de identidad',
      redirect: '/admin/dashboard/data/identity-document-types',
    })
  }

  const identityDocumentType = await getIdentityDocumentTypeById(
    Number(identityDocumentTypeId)
  )

  if (!identityDocumentType) {
    throw badRequest({
      message: 'No se encontró el tipo de documento de identidad',
      redirect: '/admin/dashboard/data/identity-document-types',
    })
  }

  return json({ identityDocumentType })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { identityDocumentTypeId } = params
  if (!identityDocumentTypeId || isNaN(Number(identityDocumentTypeId))) {
    throw badRequest({
      message: 'No se encontró el ID del tipo de documento de identidad',
      redirect: '/admin/dashboard/data/identity-document-types',
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await identityDocumentTypeValidator.validate(formData)

    if (error) {
      return validationError(error, submittedData)
    }

    await updateIdentityDocumentTypeById(Number(identityDocumentTypeId), data)
  } else if (request.method === 'DELETE') {
    await deleteIdentityDocumentTypeById(Number(identityDocumentTypeId))
  }

  return redirect('/admin/dashboard/data/identity-document-types')
}

const onCloseRedirectTo =
  '/admin/dashboard/data/identity-document-types' as const

export default function BenefitCategoryUpdateRoute() {
  const { identityDocumentType } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar tipo de documento de identidad</Title>

        <IdentityDocumentTypeForm
          buttonText="Guardar"
          defaultValues={{ name: identityDocumentType.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
