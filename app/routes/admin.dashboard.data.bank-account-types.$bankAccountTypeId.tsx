import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { Modal } from '~/components/Dialog/Modal'
import { BankAccountTypeForm } from '~/components/Forms/BankAccountTypeForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { bankAccountTypeValidator } from '~/services/bank-account-type/bank-account-type.schema'
import {
  deleteBankAccountTypeById,
  updateBankAccountTypeById,
  getBankAccountTypeById,
} from '~/services/bank-account-type/bank-account-type.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { bankAccountTypeId } = params

  if (!bankAccountTypeId || isNaN(Number(bankAccountTypeId))) {
    throw badRequest({
      message: 'No se encontró el ID del tipo de cuenta bancaria',
      redirect: '/admin/dashboard/data/bank-account-types',
    })
  }

  const bankAccountType = await getBankAccountTypeById(
    Number(bankAccountTypeId)
  )

  if (!bankAccountType) {
    throw badRequest({
      message: 'No se encontró el tipo de cuenta bancaria',
      redirect: '/admin/dashboard/data/bank-account-types',
    })
  }

  return json({ bankAccountType })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { bankAccountTypeId } = params
  if (!bankAccountTypeId || isNaN(Number(bankAccountTypeId))) {
    throw badRequest({
      message: 'No se encontró el ID del tipo de cuenta bancaria',
      redirect: '/admin/dashboard/data/bank-account-types',
    })
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await bankAccountTypeValidator.validate(formData)

    if (error) {
      return validationError(error, submittedData)
    }

    await updateBankAccountTypeById(Number(bankAccountTypeId), data)
  } else if (request.method === 'DELETE') {
    await deleteBankAccountTypeById(Number(bankAccountTypeId))
  }

  return redirect('/admin/dashboard/data/bank-account-types')
}

const onCloseRedirectTo = '/admin/dashboard/data/bank-account-types' as const

export default function BenefitCategoryUpdateRoute() {
  const { bankAccountType } = useLoaderData<typeof loader>()

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Actualizar tipo de cuenta bancaria</Title>

        <BankAccountTypeForm
          buttonText="Guardar"
          defaultValues={{ name: bankAccountType.name }}
          showDeleteButton
        />
      </RightPanel>
    </Modal>
  )
}
