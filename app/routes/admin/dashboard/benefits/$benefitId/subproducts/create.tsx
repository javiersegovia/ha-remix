import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { validationError } from 'remix-validated-form'
import { notFound } from 'remix-utils'

import { requireAdminUserId } from '~/session.server'

import { Modal } from '~/components/Dialog/Modal'
import { BenefitSubproductForm } from '~/components/Forms/BenefitSubproductForm'
import { createBenefitSubproduct } from '~/services/benefit-subproduct/benefit-subproduct.server'
import { benefitSubproductValidator } from '~/services/benefit-subproduct/benefit-subproduct.schema'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw notFound(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  return json({
    benefitId,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId || isNaN(Number(benefitId))) {
    throw notFound(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  const formData = await request.formData()

  const { data, submittedData, error } =
    await benefitSubproductValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createBenefitSubproduct(data, Number(benefitId))

  return redirect(`/admin/dashboard/benefits/${benefitId}/subproducts`)
}

export default function BenefitSubproductCreateRoute() {
  const { benefitId } = useLoaderData<typeof loader>()

  const onCloseRedirectTo = `/admin/dashboard/benefits/${benefitId}/subproducts`

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <BenefitSubproductForm
        title="Crear Subproducto"
        buttonText="Crear"
        onCloseRedirectTo={onCloseRedirectTo}
      />
    </Modal>
  )
}
