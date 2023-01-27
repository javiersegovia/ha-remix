import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { badRequest, notFound } from 'remix-utils'
import { validationError } from 'remix-validated-form'
import { BenefitForm } from '~/components/Forms/BenefitForm'
import { Title } from '~/components/Typography/Title'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import {
  deleteBenefitById,
  getBenefitById,
  updateBenefitById,
} from '~/services/benefit/benefit.server'
import { requireAdminUserId } from '~/session.server'
import { json } from '@remix-run/node'

type LoaderData = {
  benefit: NonNullable<Awaited<ReturnType<typeof getBenefitById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw notFound({
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

  throw badRequest(null, {
    statusText: 'El método HTTP utilizado es inválido',
  })
}

const AdminDashboardBenefitDetailsIndexRoute = () => {
  const { benefit } = useLoaderData<LoaderData>()

  const { name, imageUrl, buttonText, buttonHref, slug, subproducts } = benefit

  return (
    <>
      <Title className="my-10">Actualizar beneficio</Title>

      <BenefitForm
        buttonText="Guardar"
        showDelete
        defaultValues={{
          name,
          imageUrl,
          buttonText,
          buttonHref,
          slug,
          subproducts,
        }}
      />
    </>
  )
}

export default AdminDashboardBenefitDetailsIndexRoute
