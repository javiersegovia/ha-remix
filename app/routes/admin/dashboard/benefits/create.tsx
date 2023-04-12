import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { Link, useLoaderData } from '@remix-run/react'
import {
  unstable_parseMultipartFormData as parseMultipartFormData,
  json,
} from '@remix-run/node'
import { validationError } from 'remix-validated-form'
import { AiOutlineArrowLeft } from 'react-icons/ai'

import { benefitValidator } from '~/services/benefit/benefit.schema'
import { requireAdminUserId } from '~/session.server'
import { createBenefit } from '~/services/benefit/benefit.server'
import { BenefitForm } from '~/components/Forms/BenefitForm'
import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { getBenefitCategoriesWithoutCompanies } from '~/services/benefit-category/benefit-category.server'
import { uploadHandler } from '~/services/aws/s3.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  return json({
    benefitCategories: await getBenefitCategoriesWithoutCompanies(),
  })
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

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
  const mainImage = imageFormData.get('mainImage')
  const mainImageKey = typeof mainImage === 'string' ? mainImage : undefined

  const benefitHighlightImage = imageFormData.get('benefitHighlight.image')
  const benefitHighlightImageKey =
    typeof benefitHighlightImage === 'string'
      ? benefitHighlightImage
      : undefined

  await createBenefit({
    ...data,
    mainImageKey,
    benefitHighlight: data.benefitHighlight
      ? {
          ...data.benefitHighlight,
          imageKey: benefitHighlightImageKey,
        }
      : undefined,
  })

  return redirect(`/admin/dashboard/benefits`)
}

export default function CreateBenefitRoute() {
  const { benefitCategories } = useLoaderData<typeof loader>()

  return (
    <Container>
      <Link
        to="/admin/dashboard/benefits"
        className="ml-auto mb-10 flex gap-3 font-medium text-cyan-600"
      >
        <AiOutlineArrowLeft className="text-2xl" />
        <span className="tracking-widest">Regresar</span>
      </Link>

      <Title className="mb-10">Crear beneficio</Title>

      <BenefitForm benefitCategories={benefitCategories} buttonText="Crear" />
    </Container>
  )
}
