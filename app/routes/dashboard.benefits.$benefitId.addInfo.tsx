import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/server-runtime'
import { getEmployeeEnabledBenefits } from '~/services/permissions/permissions.server'
import { getBenefitById } from '~/services/benefit/benefit.server'
import { requireUserId } from '~/session.server'
import { badRequest } from '~/utils/responses'

import { Title } from '~/components/Typography/Title'
import { Modal } from '~/components/Dialog/Modal'
import { CenterPanel } from '~/components/Layout/CenterPanel'
import { useLoaderData } from '@remix-run/react'
import { DataItemForm } from '~/components/Forms/DataItemForm'

export const meta: MetaFunction = () => {
  return {
    title: 'Beneficios | HoyTrabajas Beneficios',
  }
}

export type BenefitRouteData = {
  benefit: Awaited<ReturnType<typeof getBenefitById>>
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del beneficio',
      redirect: `/dashboard/benefits`,
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw badRequest({
      message: 'No pudimos encontrar el beneficio',
      redirect: `/dashboard/benefits`,
    })
  }

  const benefits = await getEmployeeEnabledBenefits(userId)
  const hasBenefit = benefits.some((b) => b.id === parseFloat(benefitId))

  if (!hasBenefit) {
    throw badRequest({
      message:
        'No estás autorizado para visualizar los detalles de este beneficio',
      redirect: `/dashboard/benefits`,
    })
  }
  const onCloseRedirectTo = `/dashboard/benefits/${benefit.id}/details` as const
  return json({
    benefit,
    onCloseRedirectTo,
  })
}

export default function BenefitDetailsAddInfoRoute() {
  const { benefit, onCloseRedirectTo } = useLoaderData<typeof loader>()
  const { name } = benefit
  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <CenterPanel>
          <h1 className="flex text-2xl font-bold text-steelBlue-800">
            Usa tu beneficio:
          </h1>
          <Title className="m-auto flex w-min place-items-center justify-center justify-self-center rounded-full border-4 border-slate-100 bg-slate-100 p-2 text-steelBlue-600 shadow-xl">
            {name}
          </Title>

          <p>Completa tus detalles para hacer la solicitud:</p>

          <DataItemForm buttonText="Solicitar"></DataItemForm>
        </CenterPanel>
      </Modal>
    </>
  )
}
