import type { ActionFunction } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { Modal } from '~/components/Dialog/Modal'
import { requireAdminUserId } from '~/session.server'
import { createBenefit } from '~/services/benefit/benefit.server'
import { BenefitForm } from '~/components/Forms/BenefitForm'

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await benefitValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createBenefit(data)

  return redirect(`/admin/dashboard/benefits`)
}

export default function CreateBenefitRoute() {
  const onCloseRedirectTo = '/admin/dashboard/benefits'
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <BenefitForm
        title="Crear beneficio"
        buttonText="Crear"
        onCloseRedirectTo={onCloseRedirectTo}
      />
    </Modal>
  )
}
