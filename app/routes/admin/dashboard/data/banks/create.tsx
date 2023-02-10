import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { BankForm } from '~/components/Forms/BankForm'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { bankValidator } from '~/services/bank/bank.schema'
import { createBank } from '~/services/bank/bank.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()
  const { data, submittedData, error } = await bankValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createBank(data)

  return redirect('/admin/dashboard/data/banks')
}

const onCloseRedirectTo = '/admin/dashboard/data/banks' as const

export default function BanksCreateRoute() {
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
        <Title>Crear banco</Title>

        <BankForm buttonText="Crear" />
      </RightPanel>
    </Modal>
  )
}
