import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { SalaryRangeForm } from '~/components/Forms/SalaryRangeForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { salaryRangeValidator } from '~/services/salary-range/salary-range.schema'
import { createSalaryRange } from '~/services/salary-range/salary-range.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()
  const { data, submittedData, error } = await salaryRangeValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createSalaryRange(data)

  return redirect('/admin/dashboard/data/salary-ranges')
}

const onCloseRedirectTo = '/admin/dashboard/data/salary-ranges' as const

export default function SalaryRangesCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear rango salarial</Title>

        <SalaryRangeForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
