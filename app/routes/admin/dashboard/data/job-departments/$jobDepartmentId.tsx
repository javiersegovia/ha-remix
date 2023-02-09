import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { badRequest } from 'remix-utils'
import { validationError } from 'remix-validated-form'
import { Modal } from '~/components/Dialog/Modal'
import { JobDepartmentForm } from '~/components/Forms/JobDepartmentForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { jobDepartmentValidator } from '~/services/job-department/job-department.schema'
import {
  deleteJobDepartmentById,
  updateJobDepartmentById,
} from '~/services/job-department/job-department.server'
import { requireAdminUserId } from '~/session.server'
import { getJobDepartmentById } from '../../../../../services/job-department/job-department.server'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

type LoaderData = {
  jobDepartment: NonNullable<Awaited<ReturnType<typeof getJobDepartmentById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { jobDepartmentId } = params

  if (!jobDepartmentId || isNaN(Number(jobDepartmentId))) {
    throw badRequest('No se encontró el ID del área de trabajo')
  }

  const jobDepartment = await getJobDepartmentById(Number(jobDepartmentId))

  if (!jobDepartment) {
    throw badRequest('No se encontró el área de trabajo')
  }

  return json<LoaderData>({ jobDepartment })
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { jobDepartmentId } = params

  if (!jobDepartmentId || isNaN(Number(jobDepartmentId))) {
    throw badRequest('No se encontró el ID del área de trabajo')
  }
  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await jobDepartmentValidator.validate(formData)
    if (error) {
      return validationError(error, submittedData)
    }

    await updateJobDepartmentById(Number(jobDepartmentId), data)
  } else if (request.method === 'DELETE') {
    await deleteJobDepartmentById(Number(jobDepartmentId))
  }
  return redirect('/admin/dashboard/data/job-departments')
}

const onCloseRedirectTo = '/admin/dashboard/data/job-departments' as const

export default function JobDepartmentUpdateRoute() {
  const { jobDepartment } = useLoaderData<LoaderData>()
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar área de trabajo</Title>

        <JobDepartmentForm
          buttonText="Guardar"
          defaultValues={{ name: jobDepartment.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
