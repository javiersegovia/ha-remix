import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { badRequest } from 'remix-utils'
import { requireAdminUserId } from '~/session.server'
import { json, redirect } from '@remix-run/node'
import {
  deleteAgeRangeById,
  getAgeRangeById,
  updateAgeRangeById,
} from '~/services/age-range/age-range.server'
import { ageRangeValidator } from '~/services/age-range/age-range.schema'
import { validationError } from 'remix-validated-form'
import { useLoaderData } from '@remix-run/react'
import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { AgeRangeForm } from '~/components/Forms/AgeRangeForm'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { ageRangeId } = params

  if (!ageRangeId || isNaN(Number(ageRangeId))) {
    throw badRequest({
      message: 'No se encontró el ID del rango',
      redirect: onCloseRedirectTo,
    })
  }
  const ageRange = await getAgeRangeById(Number(ageRangeId))

  if (!ageRange) {
    throw badRequest({
      message: 'No se encontró el rango',
      redirect: onCloseRedirectTo,
    })
  }
  return json({ ageRange })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { ageRangeId } = params

  if (!ageRangeId || isNaN(Number(ageRangeId))) {
    throw badRequest({
      message: 'No se encontró el ID del rango',
      redirect: onCloseRedirectTo,
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } = await ageRangeValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    await updateAgeRangeById(Number(ageRangeId), data)
  } else if (request.method === 'DELETE') {
    await deleteAgeRangeById(Number(ageRangeId))
  }

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = '/admin/dashboard/data/age-ranges' as const

export default function AgeRangeUpdateRoute() {
  const { ageRange } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar rango de edad</Title>

        <AgeRangeForm
          buttonText="Guardar"
          defaultValues={{
            id: ageRange.id,
            minAge: ageRange.minAge,
            maxAge: ageRange.maxAge,
          }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
