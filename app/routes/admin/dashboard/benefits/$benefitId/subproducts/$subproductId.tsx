import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { badRequest } from 'remix-utils'
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

type LoaderData = {
  benefitId: string
  subproduct: NonNullable<Awaited<ReturnType<typeof getBenefitSubproductById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { benefitId, subproductId } = params

  if (!benefitId || !subproductId || isNaN(Number(subproductId))) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio o el subproducto',
    })
  }

  const subproduct = await getBenefitSubproductById(Number(subproductId))

  if (!subproduct) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el subproducto',
    })
  }

  return json<LoaderData>({
    benefitId,
    subproduct,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { benefitId, subproductId } = params

  if (!benefitId || !subproductId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio o el subproducto',
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

  throw badRequest(null, {
    statusText: 'El método HTTP utilizado es inválido',
  })
}

export default function BenefitSubproductDetailsRoute() {
  const { benefitId, subproduct } = useLoaderData<LoaderData>()

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
