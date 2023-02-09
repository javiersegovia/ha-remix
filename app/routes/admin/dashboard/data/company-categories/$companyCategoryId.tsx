import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { requireAdminUserId } from '~/session.server'
import { badRequest } from 'remix-utils'
import { json } from '@remix-run/node'
import {
  deleteCompanyCategoryById,
  getCompanyCategoryById,
  updateCompanyCategoryById,
} from '../../../../../services/company-category/company-category.server'
import { companyCategoryValidator } from '../../../../../services/company-category/company-category.schema'
import { validationError } from 'remix-validated-form'
import { Modal } from '~/components/Dialog/Modal'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { CompanyCategoryForm } from '~/components/Forms/CompanyCategoryForm'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  companyCategory: NonNullable<
    Awaited<ReturnType<typeof getCompanyCategoryById>>
  >
}
export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { companyCategoryId } = params
  if (!companyCategoryId || isNaN(Number(companyCategoryId))) {
    throw badRequest('No se encontró el ID de la categoría de compañía')
  }
  const companyCategory = await getCompanyCategoryById(
    Number(companyCategoryId)
  )
  if (!companyCategory) {
    throw badRequest('No se encontró la categoría de compañía')
  }
  return json<LoaderData>({ companyCategory })
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { companyCategoryId } = params

  if (!companyCategoryId || isNaN(Number(companyCategoryId))) {
    throw badRequest('No se encontró el ID de la categoría de compañía')
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
  const { companyCategory } = useLoaderData<LoaderData>()
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
