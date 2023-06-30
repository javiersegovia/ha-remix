import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Modal } from '~/components/Dialog/Modal'
import { JobDepartmentForm } from '~/components/Forms/JobDepartmentForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import {
  getJobDepartmentById,
  deleteJobDepartmentById,
  updateJobDepartmentById,
} from '~/services/job-department/job-department.server'
import { jobDepartmentValidator } from '~/services/job-department/job-department.schema'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { jobDepartmentId } = params

  if (!jobDepartmentId || isNaN(Number(jobDepartmentId))) {
    throw badRequest({
      message: 'No se encontró el ID del área de trabajo',
      redirect: '/admin/dashboard/data/job-departments',
    })
  }

  const jobDepartment = await getJobDepartmentById(Number(jobDepartmentId))

  if (!jobDepartment) {
    throw badRequest({
      message: 'No se encontró el área de trabajo',
      redirect: '/admin/dashboard/data/job-departments',
    })
  }

  return json({ jobDepartment })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { jobDepartmentId } = params

  if (!jobDepartmentId || isNaN(Number(jobDepartmentId))) {
    throw badRequest({
      message: 'No se encontró el ID del área de trabajo',
      redirect: '/admin/dashboard/data/job-departments',
    })
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
  const { jobDepartment } = useLoaderData<typeof loader>()

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
