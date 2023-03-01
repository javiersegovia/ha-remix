import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'

import { requireAdminUserId } from '~/session.server'
import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import {
  deleteGenderById,
  getGenderById,
  updateGenderById,
} from '~/services/gender/gender.server'
import { genderValidator } from '~/services/gender/gender.schema'
import { GenderForm } from '~/components/Forms/GenderForm'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { genderId } = params

  if (!genderId || isNaN(Number(genderId))) {
    throw badRequest({
      message: 'No se encontró el ID del género',
      redirect: '/admin/dashboard/data/genders',
    })
  }

  const gender = await getGenderById(Number(genderId))

  if (!gender) {
    throw badRequest({
      message: 'No se encontró el género',
      redirect: '/admin/dashboard/data/genders',
    })
  }
  return json({ gender })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { genderId } = params

  if (!genderId || isNaN(Number(genderId))) {
    throw badRequest({
      message: 'No se encontró el ID del género',
      redirect: '/admin/dashboard/data/genders',
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } = await genderValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    await updateGenderById(Number(genderId), data)
  } else if (request.method === 'DELETE') {
    await deleteGenderById(Number(genderId))
  }

  return redirect('/admin/dashboard/data/genders')
}

const onCloseRedirectTo = '/admin/dashboard/data/genders' as const

export default function GenderUpdateRoute() {
  const { gender } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar género</Title>

        <GenderForm
          buttonText="Guardar"
          defaultValues={{ name: gender.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
