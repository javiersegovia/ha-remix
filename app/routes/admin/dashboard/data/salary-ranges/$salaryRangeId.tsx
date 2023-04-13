import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { Modal } from '~/components/Dialog/Modal'
import { SalaryRangeForm } from '~/components/Forms/SalaryRangeForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { salaryRangeValidator } from '~/services/salary-range/salary-range.schema'
import {
  deleteSalaryRangeById,
  updateSalaryRangeById,
  getSalaryRangeById,
} from '~/services/salary-range/salary-range.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { salaryRangeId } = params

  if (!salaryRangeId || isNaN(Number(salaryRangeId))) {
    throw badRequest({
      message: 'No se encontró el ID del rango salarial',
      redirect: '/admin/dashboard/data/salary-ranges',
    })
  }

  const salaryRange = await getSalaryRangeById(Number(salaryRangeId))

  if (!salaryRange) {
    throw badRequest({
      message: 'No se encontró el rango salarial',
      redirect: '/admin/dashboard/data/salary-ranges',
    })
  }

  return json({ salaryRange })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { salaryRangeId } = params
  if (!salaryRangeId || isNaN(Number(salaryRangeId))) {
    throw badRequest({
      message: 'No se encontró el ID del rango salarial',
      redirect: '/admin/dashboard/data/salary-ranges',
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } = await salaryRangeValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    await updateSalaryRangeById(Number(salaryRangeId), data)
  } else if (request.method === 'DELETE') {
    await deleteSalaryRangeById(Number(salaryRangeId))
  }

  return redirect('/admin/dashboard/data/salary-ranges')
}

const onCloseRedirectTo = '/admin/dashboard/data/salary-ranges' as const

export default function SalaryRangeUpdateRoute() {
  const { salaryRange } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar rango salarial</Title>

        <SalaryRangeForm
          buttonText="Guardar"
          defaultValues={{ name: salaryRange.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
