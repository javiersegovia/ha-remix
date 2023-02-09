import type { MetaFunction, ActionFunction, LoaderArgs } from '@remix-run/node'

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
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node'
import { uploadHandler } from '~/services/aws/s3.server'
import { getBenefitCategories } from '~/services/benefit-category/benefit-category.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Beneficio no encontrado | HoyAdelantas',
    }
  }

  const { benefit } = data

  return {
    title: `[Admin] ${benefit.name} | HoyAdelantas`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
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

  return json({
    benefit,
    benefitCategories: await getBenefitCategories(),
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
    /** We need to access two instances of FormData, one for validation and other for parseMultipartFormData,
     * hence we need to clone the request to avoid consuming the original request body
     */
    const clonedRequest = request.clone()
    const formData = await clonedRequest.formData()

    const { data, submittedData, error } = await benefitValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    const imageFormData = await parseMultipartFormData(request, uploadHandler)
    const key = imageFormData.get('mainImage')
    const mainImageKey = typeof key === 'string' ? key : undefined

    await updateBenefitById(
      {
        ...data,
        mainImageKey,
      },
      parseFloat(benefitId)
    )

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
  const { benefit, benefitCategories } = useLoaderData<typeof loader>()

  const { name, imageUrl, buttonText, buttonHref, slug, benefitCategoryId } =
    benefit

  return (
    <section className="my-10">
      <Title className="mb-10">Actualizar beneficio</Title>

      <BenefitForm
        buttonText="Guardar"
        showDelete
        benefitCategories={benefitCategories}
        defaultValues={{
          name,
          imageUrl,
          buttonText,
          buttonHref,
          slug,
          benefitCategoryId,
          mainImageUrl: benefit.mainImage?.url,
        }}
      />
    </section>
  )
}

export default AdminDashboardBenefitDetailsIndexRoute
