import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from 'remix-utils'

import { Modal } from '~/components/Dialog/Modal'
import { BenefitCategoryForm } from '~/components/Forms/BenefitCategoryForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { benefitCategoryValidator } from '~/services/benefit-category/benefit-category.schema'
import {
  deleteBenefitCategoryById,
  getBenefitCategoryById,
  updateBenefitCategoryById,
} from '~/services/benefit-category/benefit-category.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { benefitCategoryId } = params
  if (!benefitCategoryId || isNaN(Number(benefitCategoryId))) {
    throw badRequest('No se encontró el ID de la categoría de beneficio')
  }

  const benefitCategory = await getBenefitCategoryById(
    Number(benefitCategoryId)
  )

  if (!benefitCategory) {
    throw badRequest('No se encontró la categoría de beneficio')
  }

  return json({ benefitCategory })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { benefitCategoryId } = params
  if (!benefitCategoryId || isNaN(Number(benefitCategoryId))) {
    throw badRequest('No se encontró el ID de la categoría de beneficio')
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await benefitCategoryValidator.validate(formData)

    if (error) {
      return validationError(error, submittedData)
    }

    await updateBenefitCategoryById(Number(benefitCategoryId), data)
  } else if (request.method === 'DELETE') {
    await deleteBenefitCategoryById(Number(benefitCategoryId))
  }

  return redirect('/admin/dashboard/data/benefit-categories')
}

const onCloseRedirectTo = '/admin/dashboard/data/benefit-categories' as const
export default function BenefitCategoryUpdateRoute() {
  const { benefitCategory } = useLoaderData<typeof loader>()
  const { name, hexColor, opacity } = benefitCategory

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar categoría</Title>

        <BenefitCategoryForm
          buttonText="Guardar"
          defaultValues={{ name, hexColor, opacity }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
