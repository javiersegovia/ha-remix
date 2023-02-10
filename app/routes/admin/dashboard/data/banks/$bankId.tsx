import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from 'remix-utils'

import { Modal } from '~/components/Dialog/Modal'
import { BankForm } from '~/components/Forms/BankForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { bankValidator } from '~/services/bank/bank.schema'
import { getBankById } from '~/services/bank/bank.server'
import { deleteBankById, updateBankById } from '~/services/bank/bank.server'
import { requireAdminUserId } from '~/session.server'

type LoaderData = {
  bank: NonNullable<Awaited<ReturnType<typeof getBankById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { bankId } = params
  if (!bankId || isNaN(Number(bankId))) {
    throw badRequest('No se encontró el ID del banco')
  }

  const bank = await getBankById(Number(bankId))

  if (!bank) {
    throw badRequest('No se encontró el banco')
  }

  return json<LoaderData>({ bank })
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { bankId } = params
  if (!bankId || isNaN(Number(bankId))) {
    throw badRequest('No se encontró el ID del banco')
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
  const { bank } = useLoaderData<LoaderData>()

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
