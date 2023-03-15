import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { Modal } from '~/components/Dialog/Modal'
import { BenefitCategoryForm } from '~/components/Forms/BenefitCategoryForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { benefitCategoryValidator } from '~/services/benefit-category/benefit-category.schema'

import { requireUserId } from '~/session.server'

import {
  deleteBenefitCategoryById,
  getBenefitCategoryById,
  updateBenefitCategoryById,
} from '~/services/benefit-category/benefit-category.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { useToastError } from '~/hooks/useToastError'

export const meta: MetaFunction = () => {
  return {
    title: 'Actualizar categoría de beneficio | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)

  await requirePermissionByUserId(userId, PermissionCode.MANAGE_BENEFIT)

  const { benefitCategoryId } = params

  if (!benefitCategoryId || isNaN(Number(benefitCategoryId))) {
    throw badRequest({
      message: 'No se encontró el ID de la categoría de beneficio',
      redirect: '/dashboard/manage/benefit-categories',
    })
  }

  const benefitCategory = await getBenefitCategoryById(
    Number(benefitCategoryId)
  )

  if (!benefitCategory) {
    throw badRequest({
      message: 'No se encontró la categoría de beneficio',
      redirect: '/dashboard/manage/benefit-categories',
    })
  }

  return json({ benefitCategory })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireUserId(request)

  const { benefitCategoryId } = params

  if (!benefitCategoryId || isNaN(Number(benefitCategoryId))) {
    throw badRequest({
      message: 'No se encontró el ID de la categoría de beneficio',
      redirect: '/dashboard/manage/benefit-categories',
    })
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

  return redirect('/dashboard/manage/benefit-categories')
}

const onCloseRedirectTo = '/dashboard/manage/benefit-categories' as const

export default function CompanyBenefitCategoryUpdateRoute() {
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

export const CatchBoundary = () => {
  useToastError()
  return null
}
