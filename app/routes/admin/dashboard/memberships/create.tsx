import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { requireAdminUserId } from '~/session.server'
import { MembershipForm } from '~/components/Forms/MembershipForm'
import { Modal } from '~/components/Dialog/Modal'
import { membershipValidator } from '~/services/membership/membership.schema'
import { createMembership } from '~/services/membership/membership.server'
import { getBenefits } from '~/services/benefit/benefit.server'

type LoaderData = {
  benefits: Awaited<ReturnType<typeof getBenefits>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  return json<LoaderData>({
    benefits: await getBenefits(),
  })
}

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await membershipValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createMembership(data)

  return redirect(`/admin/dashboard/memberships`)
}

export default function CreateMembershipRoute() {
  const { benefits } = useLoaderData<LoaderData>()

  const onCloseRedirectTo = '/admin/dashboard/memberships'
  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <MembershipForm
        title="Crear membresía"
        buttonText="Crear"
        benefits={benefits}
        onCloseRedirectTo={onCloseRedirectTo}
      />
    </Modal>
  )
}
