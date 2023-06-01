import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { Modal } from '~/components/Dialog/Modal'
import { JobDepartmentForm } from '~/components/Forms/JobDepartmentForm'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { RightPanel } from '~/components/Layout/RightPanel'
import { jobDepartmentValidator } from '~/services/job-department/job-department.schema'
import { validationError } from 'remix-validated-form'
import { createJobDepartment } from '~/services/job-department/job-department.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await jobDepartmentValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createJobDepartment(data)

  return redirect('/admin/dashboard/data/job-departments')
}

const onCloseRedirectTo = '/admin/dashboard/data/job-departments' as const

export default function JobDepartmentCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear área de trabajo</Title>

        <JobDepartmentForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
