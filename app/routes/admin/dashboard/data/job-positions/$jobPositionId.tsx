import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from 'remix-utils'

import { Modal } from '~/components/Dialog/Modal'
import { JobPositionForm } from '~/components/Forms/JobPositionForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { jobPositionValidator } from '~/services/job-position/job-position.schema'
import {
  deleteJobPositionById,
  updateJobPositionById,
  getJobPositionById,
} from '~/services/job-position/job-position.server'
import { requireAdminUserId } from '~/session.server'

type LoaderData = {
  jobPosition: NonNullable<Awaited<ReturnType<typeof getJobPositionById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { jobPositionId } = params
  if (!jobPositionId || isNaN(Number(jobPositionId))) {
    throw badRequest('No se encontró el ID del cargo de trabajo')
  }

  const jobPosition = await getJobPositionById(Number(jobPositionId))

  if (!jobPosition) {
    throw badRequest('No se encontró el cargo de trabajo')
  }

  return json<LoaderData>({ jobPosition })
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { jobPositionId } = params
  if (!jobPositionId || isNaN(Number(jobPositionId))) {
    throw badRequest('No se encontró el ID del cargo de trabajo')
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } = await jobPositionValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    await updateJobPositionById(Number(jobPositionId), data)
  } else if (request.method === 'DELETE') {
    await deleteJobPositionById(Number(jobPositionId))
  }

  return redirect('/admin/dashboard/data/job-positions')
}

const onCloseRedirectTo = '/admin/dashboard/data/job-positions' as const
export default function BenefitCategoryUpdateRoute() {
  const { jobPosition } = useLoaderData<LoaderData>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar cargo de trabajo</Title>

        <JobPositionForm
          buttonText="Guardar"
          defaultValues={{ name: jobPosition.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
