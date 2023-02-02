import type { ActionFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { BenefitCategoryForm } from '~/components/Forms/BenefitCategoryForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { benefitCategoryValidator } from '~/services/benefit-category/benefit-category.schema'
import { createBenefitCategory } from '~/services/benefit-category/benefit-category.server'

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } =
    await benefitCategoryValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createBenefitCategory(data)

  return redirect('/admin/dashboard/data/benefit-categories')
}

const onCloseRedirectTo = '/admin/dashboard/data/benefit-categories' as const

export default function BenefitCategoriesCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear categoría</Title>

        <BenefitCategoryForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
