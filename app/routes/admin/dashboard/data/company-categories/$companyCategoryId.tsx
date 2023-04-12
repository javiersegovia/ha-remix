import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'

import {
  deleteCompanyCategoryById,
  getCompanyCategoryById,
  updateCompanyCategoryById,
} from '~/services/company-category/company-category.server'
import { requireAdminUserId } from '~/session.server'
import { companyCategoryValidator } from '~/services/company-category/company-category.schema'
import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { CompanyCategoryForm } from '~/components/Forms/CompanyCategoryForm'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyCategoryId } = params

  if (!companyCategoryId || isNaN(Number(companyCategoryId))) {
    throw badRequest({
      message: 'No se encontró el ID de la categoría de compañía',
      redirect: '/admin/dashboard/data/company-categories',
    })
  }

  const companyCategory = await getCompanyCategoryById(
    Number(companyCategoryId)
  )

  if (!companyCategory) {
    throw badRequest({
      message: 'No se encontró la categoría de compañía',
      redirect: '/admin/dashboard/data/company-categories',
    })
  }

  return json({ companyCategory })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { companyCategoryId } = params

  if (!companyCategoryId || isNaN(Number(companyCategoryId))) {
    throw badRequest({
      message: 'No se encontró el ID de la categoría de compañía',
      redirect: '/admin/dashboard/data/company-categories',
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await companyCategoryValidator.validate(formData)

    if (error) {
      return validationError(error, submittedData)
    }

    await updateCompanyCategoryById(Number(companyCategoryId), data)
  } else if (request.method === 'DELETE') {
    await deleteCompanyCategoryById(Number(companyCategoryId))
  }
  return redirect('/admin/dashboard/data/company-categories')
}

const onCloseRedirectTo = '/admin/dashboard/data/company-categories' as const

export default function CompanyCategoryUpdateRoute() {
  const { companyCategory } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar categoría de compañía</Title>

        <CompanyCategoryForm
          buttonText="Guardar"
          defaultValues={{ name: companyCategory.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
