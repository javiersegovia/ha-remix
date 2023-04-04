import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node'

import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { badRequest, notFound } from '~/utils/responses'
import { BenefitForm } from '~/components/Forms/BenefitForm'
import { Title } from '~/components/Typography/Title'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import {
  deleteBenefitById,
  getBenefitById,
  updateBenefitById,
} from '~/services/benefit/benefit.server'
import { requireEmployee, requireUserId } from '~/session.server'
import { uploadHandler } from '~/services/aws/s3.server'
import {
  getBenefitCategoriesByCompanyId,
  getBenefitCategoriesWithoutCompanies,
} from '~/services/benefit-category/benefit-category.server'
import { Container } from '~/components/Layout/Container'
import { useToastError } from '~/hooks/useToastError'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { GoBack } from '~/components/Button/GoBack'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Beneficio no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { benefit } = data

  return {
    title: `${benefit.name} | HoyTrabajas Beneficios`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_BENEFIT
  )

  const { benefitId } = params

  if (!benefitId || isNaN(parseFloat(benefitId))) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/dashboard/manage/benefits',
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw notFound({
      message: 'No se ha encontrado información sobre el beneficio',
      redirect: '/dashboard/manage/benefits',
    })
  }

  const benefitCategories = await getBenefitCategoriesWithoutCompanies()
  const companyBenefitCategories = await getBenefitCategoriesByCompanyId(
    employee.companyId
  )

  return json({
    benefit,
    benefitCategories: [...companyBenefitCategories, ...benefitCategories],
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/dashboard/manage/benefits',
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

    await updateBenefitById(
      data,
      parseFloat(benefitId),
      '/dashboard/manage/benefits'
    )

    return redirect(`/dashboard/manage/benefits`)
  } else if (request.method === 'DELETE') {
    await deleteBenefitById(parseFloat(benefitId))

    return redirect(`/dashboard/manage/benefits`)
  }

  throw badRequest({
    message: 'El método HTTP utilizado es inválido',
    redirect: '/dashboard/manage/benefits',
  })
}

const CompanyBenefitDetailsIndexRoute = () => {
  const { benefit, benefitCategories } = useLoaderData<typeof loader>()

  const {
    name,
    buttonText,
    buttonHref,
    slug,
    benefitCategoryId,
    benefitHighlight,
    mainImage,
  } = benefit

  return (
    <Container className="my-10 w-full">
      <GoBack redirectTo="/dashboard/manage/benefits" />

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
            mainImage,
            benefitHighlight,
          }}
        />
      </section>
    </Container>
  )
}

export default CompanyBenefitDetailsIndexRoute

export const CatchBoundary = () => {
  useToastError()
  return null
}
