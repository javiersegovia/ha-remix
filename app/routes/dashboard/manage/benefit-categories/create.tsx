import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { BenefitCategoryForm } from '~/components/Forms/BenefitCategoryForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireEmployee, requireUserId } from '~/session.server'
import { benefitCategoryValidator } from '~/services/benefit-category/benefit-category.schema'
import { createCompanyBenefitCategory } from '~/services/benefit-category/benefit-category.server'
import { useToastError } from '~/hooks/useToastError'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'

export const meta: MetaFunction = () => {
  return {
    title: 'Crear categoría de beneficio | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)
  await requirePermissionByUserId(userId, PermissionCode.MANAGE_BENEFIT)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const formData = await request.formData()

  const { data, submittedData, error } =
    await benefitCategoryValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createCompanyBenefitCategory(data, employee.companyId)

  return redirect('/dashboard/manage/benefit-categories')
}

const onCloseRedirectTo = '/dashboard/manage/benefit-categories' as const

export default function CompanyBenefitCategoriesCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear categoría de beneficio</Title>

        <BenefitCategoryForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
