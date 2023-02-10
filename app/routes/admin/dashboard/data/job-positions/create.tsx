import type { ActionFunction } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { Modal } from '~/components/Dialog/Modal'
import { JobPositionForm } from '~/components/Forms/JobPositionForm'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { RightPanel } from '~/components/Layout/RightPanel'
import { jobPositionValidator } from '~/services/job-position/job-position.schema'
import { validationError } from 'remix-validated-form'
import { createJobPosition } from '~/services/job-position/job-position.server'

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await jobPositionValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createJobPosition(data)

  return redirect('/admin/dashboard/data/job-positions')
}

const onCloseRedirectTo = '/admin/dashboard/data/job-positions' as const

export default function JobPositionCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear cargo de trabajo</Title>

        <JobPositionForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
