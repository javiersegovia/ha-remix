import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { badRequest, notFound } from '~/utils/responses'
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
import { getBenefitCategoriesWithoutCompanies } from '~/services/benefit-category/benefit-category.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Beneficio no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { benefit } = data

  return {
    title: `[Admin] ${benefit.name} | HoyTrabajas Beneficios`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { benefitId } = params

  if (!benefitId || isNaN(parseFloat(benefitId))) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/admin/dashboard/benefits',
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw notFound({
      message: 'No se ha encontrado información sobre el beneficio',
      redirect: '/admin/dashboard/benefits',
    })
  }

  return json({
    benefit,
    benefitCategories: await getBenefitCategoriesWithoutCompanies(),
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/app/dashboard/benefits',
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
    const mainImageNewKey = imageFormData.get('mainImage')

    // If we have a string, it means that the image was created on AWS, so we can use the new key
    // If we don't, we should use the old key that came from the form
    data.mainImageKey =
      typeof mainImageNewKey === 'string' ? mainImageNewKey : data.mainImageKey

    const benefitHighlightImageNewKey = imageFormData.get(
      'benefitHighlight.image'
    )

    if (data.benefitHighlight) {
      data.benefitHighlight.imageKey =
        typeof benefitHighlightImageNewKey === 'string'
          ? benefitHighlightImageNewKey
          : data.benefitHighlight?.imageKey
    }

    await updateBenefitById(data, parseFloat(benefitId))

    return redirect(`/admin/dashboard/benefits`)
  } else if (request.method === 'DELETE') {
    await deleteBenefitById(parseFloat(benefitId))

    return redirect(`/admin/dashboard/benefits`)
  }

  throw badRequest({
    message: 'El método HTTP utilizado es inválido',
    redirect: '/admin/dashboard/benefits',
  })
}

const AdminDashboardBenefitDetailsIndexRoute = () => {
  const { benefit, benefitCategories } = useLoaderData<typeof loader>()

  const {
    name,
    buttonText,
    buttonHref,
    slug,
    benefitCategoryId,
    description,
    shortDescription,
    instructions,
    benefitHighlight,
    mainImage,
  } = benefit

  return (
    <section className="my-10">
      <Title className="mb-10">Actualizar beneficio</Title>

      <BenefitForm
        buttonText="Guardar"
        showDelete
        benefitCategories={benefitCategories}
        defaultValues={{
          name,
          buttonText,
          buttonHref,
          slug,
          benefitCategoryId,
          description,
          shortDescription,
          instructions,
          mainImage,
          benefitHighlight,
        }}
      />
    </section>
  )
}

export default AdminDashboardBenefitDetailsIndexRoute
