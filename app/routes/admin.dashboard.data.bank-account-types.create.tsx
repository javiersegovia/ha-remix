import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { BankAccountTypeForm } from '~/components/Forms/BankAccountTypeForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { bankAccountTypeValidator } from '~/services/bank-account-type/bank-account-type.schema'
import { createBankAccountType } from '~/services/bank-account-type/bank-account-type.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()
  const { data, submittedData, error } =
    await bankAccountTypeValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createBankAccountType(data)

  return redirect('/admin/dashboard/data/bank-account-types')
}

const onCloseRedirectTo = '/admin/dashboard/data/bank-account-types' as const

export default function BankAccountTypesCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear tipo de cuenta bancaria</Title>

        <BankAccountTypeForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
