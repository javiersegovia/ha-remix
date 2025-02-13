import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { badRequest, notFound } from '~/utils/responses'
import { redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { MembershipForm } from '~/components/Forms/MembershipForm'
import { Modal } from '~/components/Dialog/Modal'
import { requireAdminUserId } from '~/session.server'
import { membershipValidator } from '~/services/membership/membership.schema'
import {
  deleteMembershipById,
  getMembershipById,
  updateMembershipById,
} from '~/services/membership/membership.server'
import { getBenefits } from '~/services/benefit/benefit.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { membershipId } = params

  if (!membershipId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la membresía',
      redirect: '/admin/dashboard/memberships',
    })
  }

  const membership = await getMembershipById(parseFloat(membershipId))

  if (!membership) {
    throw notFound({
      message: 'No se ha encontrado información sobre la membresía',
      redirect: '/admin/dashboard/memberships',
    })
  }
  return json({
    membership,
    benefits: await getBenefits(),
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { membershipId } = params

  if (!membershipId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la membresía',
      redirect: '/admin/dashboard/memberships',
    })
  }

  if (request.method === 'POST') {
    const { data, submittedData, error } = await membershipValidator.validate(
      await request.formData()
    )

    if (error) {
      return validationError(error, submittedData)
    }
    await updateMembershipById(data, parseFloat(membershipId))

    return redirect(`/admin/dashboard/memberships`)
  } else if (request.method === 'DELETE') {
    await deleteMembershipById(parseFloat(membershipId))

    return redirect(`/admin/dashboard/memberships`)
  }

  throw badRequest({
    message: 'El método HTTP utilizado es inválido',
    redirect: '/admin/dashboard/memberships',
  })
}

export default function UpdateMembershipRoute() {
  const { membership, benefits } = useLoaderData<typeof loader>()
  const onCloseRedirectTo = '/admin/dashboard/memberships'

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <MembershipForm
        title="Actualizar membresía"
        buttonText="Guardar"
        onCloseRedirectTo={onCloseRedirectTo}
        showDelete
        benefits={benefits}
        defaultValues={{
          name: membership.name,
          benefits: membership.benefits,
        }}
      />
    </Modal>
  )
}
