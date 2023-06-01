import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { BenefitSubproductForm } from '~/components/Forms/BenefitSubproductForm'
import {
  deleteBenefitSubproductById,
  getBenefitSubproductById,
  updateBenefitSubproductById,
} from '~/services/benefit-subproduct/benefit-subproduct.server'
import { requireAdminUserId } from '~/session.server'
import { benefitSubproductValidator } from '~/services/benefit-subproduct/benefit-subproduct.schema'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { benefitId, subproductId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: `/admin/dashboard/benefits`,
    })
  }

  if (!subproductId || isNaN(Number(subproductId))) {
    throw badRequest({
      message: 'No se ha encontrado el ID del subproducto',
      redirect: `/admin/dashboard/benefits/${benefitId}/subproducts`,
    })
  }

  const subproduct = await getBenefitSubproductById(Number(subproductId))

  if (!subproduct) {
    throw badRequest({
      message: 'No se ha encontrado el subproducto',
      redirect: '/admin/dashboard/benefits/subproducts',
    })
  }

  return json({
    benefitId,
    subproduct,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { benefitId, subproductId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: `/admin/dashboard/benefits`,
    })
  }

  if (!subproductId || isNaN(Number(subproductId))) {
    throw badRequest({
      message: 'No se ha encontrado el ID del subproducto',
      redirect: `/admin/dashboard/benefits/${benefitId}/subproducts`,
    })
  }

  if (request.method === 'POST') {
    const { data, submittedData, error } =
      await benefitSubproductValidator.validate(await request.formData())

    if (error) {
      return validationError(error, submittedData)
    }
    await updateBenefitSubproductById(parseFloat(subproductId), data)

    return redirect(`/admin/dashboard/benefits/${benefitId}/subproducts`)
  } else if (request.method === 'DELETE') {
    await deleteBenefitSubproductById(parseFloat(subproductId))

    return redirect(`/admin/dashboard/benefits/${benefitId}/subproducts`)
  }

  throw badRequest({
    message: 'El método HTTP utilizado es inválido',
    redirect: `/admin/dashboard/benefits/${benefitId}/subproducts`,
  })
}

export default function BenefitSubproductDetailsRoute() {
  const { benefitId, subproduct } = useLoaderData<typeof loader>()

  const onCloseRedirectTo = `/admin/dashboard/benefits/${benefitId}/subproducts`

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <BenefitSubproductForm
        title="Actualizar Subproducto"
        buttonText="Actualizar"
        onCloseRedirectTo={onCloseRedirectTo}
        defaultValues={{ ...subproduct }}
        showDelete
      />
    </Modal>
  )
}
