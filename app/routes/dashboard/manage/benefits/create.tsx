import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import {
  unstable_parseMultipartFormData as parseMultipartFormData,
  json,
} from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import {
  getBenefitCategoriesByCompanyId,
  getBenefitCategoriesWithoutCompanies,
} from '~/services/benefit-category/benefit-category.server'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { requireEmployee } from '~/session.server'
import { uploadHandler } from '~/services/aws/s3.server'
import { createBenefit } from '~/services/benefit/benefit.server'
import { BenefitForm } from '~/components/Forms/BenefitForm'
import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { useToastError } from '~/hooks/useToastError'
import { GoBack } from '~/components/Button/GoBack'

export const meta: MetaFunction = () => {
  return {
    title: 'Crear beneficio | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_BENEFIT
  )

  const benefitCategories = await getBenefitCategoriesWithoutCompanies()
  const companyBenefitCategories = await getBenefitCategoriesByCompanyId(
    employee.companyId
  )

  return json({
    benefitCategories: [...companyBenefitCategories, ...benefitCategories],
  })
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

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

  await createBenefit(
    {
      ...data,
      mainImageKey,
      benefitHighlight: data.benefitHighlight
        ? {
            ...data.benefitHighlight,
            imageKey: benefitHighlightImageKey,
          }
        : undefined,
    },
    employee.companyId
  )

  return redirect(`/dashboard/manage/benefits`)
}

export default function CreateBenefitRoute() {
  const { benefitCategories } = useLoaderData<typeof loader>()

  return (
    <Container className="my-10 w-full">
      <GoBack redirectTo="/dashboard/manage/benefits" />

      <Title className="mb-10">Crear beneficio</Title>

      <BenefitForm benefitCategories={benefitCategories} buttonText="Crear" />
    </Container>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
