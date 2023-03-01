import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { Modal } from '~/components/Dialog/Modal'
import { BankForm } from '~/components/Forms/BankForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { bankValidator } from '~/services/bank/bank.schema'
import {
  deleteBankById,
  updateBankById,
  getBankById,
} from '~/services/bank/bank.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { bankId } = params

  if (!bankId || isNaN(Number(bankId))) {
    throw badRequest({
      message: 'No se encontró el ID del banco',
      redirect: '/admin/dashboard/data/banks',
    })
  }

  const bank = await getBankById(Number(bankId))

  if (!bank) {
    throw badRequest({
      message: 'No se encontró el banco',
      redirect: '/admin/dashboard/data/banks',
    })
  }

  return json({ bank })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { bankId } = params
  if (!bankId || isNaN(Number(bankId))) {
    throw badRequest({
      message: 'No se encontró el ID del banco',
      redirect: '/admin/dashboard/data/banks',
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } = await bankValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    await updateBankById(Number(bankId), data)
  } else if (request.method === 'DELETE') {
    await deleteBankById(Number(bankId))
  }

  return redirect('/admin/dashboard/data/banks')
}

const onCloseRedirectTo = '/admin/dashboard/data/banks' as const

export default function BenefitCategoryUpdateRoute() {
  const { bank } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar banco</Title>

        <BankForm
          buttonText="Guardar"
          defaultValues={{ name: bank.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
