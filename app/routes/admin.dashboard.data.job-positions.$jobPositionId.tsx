import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

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

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { jobPositionId } = params
  if (!jobPositionId || isNaN(Number(jobPositionId))) {
    throw badRequest({
      message: 'No se encontró el ID del cargo de trabajo',
      redirect: '/admin/dashboard/data/job-positions',
    })
  }

  const jobPosition = await getJobPositionById(Number(jobPositionId))

  if (!jobPosition) {
    throw badRequest({
      message: 'No se encontró el cargo de trabajo',
      redirect: '/admin/dashboard/data/job-positions',
    })
  }

  return json({ jobPosition })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { jobPositionId } = params
  if (!jobPositionId || isNaN(Number(jobPositionId))) {
    throw badRequest({
      message: 'No se encontró el ID del cargo de trabajo',
      redirect: '/admin/dashboard/data/job-positions',
    })
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
  const { jobPosition } = useLoaderData<typeof loader>()

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
