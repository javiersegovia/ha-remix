import type { ActionFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { Modal } from '~/components/Dialog/Modal'
import { CompanyCategoryForm } from '~/components/Forms/CompanyCategoryForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { companyCategoryValidator } from '~/services/company-category/company-category.schema'
import { createCompanyCategory } from '~/services/company-category/company-category.server'

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } =
    await companyCategoryValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createCompanyCategory(data)

  return redirect('/admin/dashboard/data/company-categories')
}

const onCloseRedirectTo = '/admin/dashboard/data/company-categories' as const

export default function CompanyCategoryCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear categoría de compañía</Title>

        <CompanyCategoryForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
