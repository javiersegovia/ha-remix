import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { Modal } from '~/components/Dialog/Modal'
import { requireAdminUserId } from '~/session.server'
import {
  deleteBenefitById,
  getBenefitById,
  updateBenefitById,
} from '~/services/benefit/benefit.server'
import { BenefitForm } from '~/components/Forms/BenefitForm'
import { badRequest, notFound } from 'remix-utils'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  benefit: NonNullable<Awaited<ReturnType<typeof getBenefitById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { benefitId } = params

  if (!benefitId) {
    return badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    return notFound({
      message: 'No se ha encontrado información sobre el beneficio',
    })
  }
  return json<LoaderData>({
    benefit,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  if (request.method === 'POST') {
    const { data, submittedData, error } = await benefitValidator.validate(
      await request.formData()
    )

    if (error) {
      return validationError(error, submittedData)
    }
    await updateBenefitById(data, parseFloat(benefitId))

    return redirect(`/admin/dashboard/benefits`)
  } else if (request.method === 'DELETE') {
    await deleteBenefitById(parseFloat(benefitId))

    return redirect(`/admin/dashboard/benefits`)
  }

  return badRequest(null, {
    statusText: 'El método HTTP utilizado es inválido',
  })
}

export default function UpdateBenefitRoute() {
  const { benefit } = useLoaderData<LoaderData>()
  const onCloseRedirectTo = '/admin/dashboard/benefits'

  const { name, imageUrl, buttonText, buttonHref } = benefit

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <BenefitForm
        title="Actualizar beneficio"
        buttonText="Guardar"
        onCloseRedirectTo={onCloseRedirectTo}
        showDelete
        defaultValues={{
          name,
          imageUrl,
          buttonText,
          buttonHref,
        }}
      />
    </Modal>
  )
}
