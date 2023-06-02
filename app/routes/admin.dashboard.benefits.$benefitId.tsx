import type { LoaderArgs } from '@remix-run/server-runtime'
import type { TabItem } from '~/components/Tabs/Tabs'

import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from '~/utils/responses'
import { AiOutlineArrowLeft } from 'react-icons/ai'

import { requireAdminUserId } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { Tabs } from '~/components/Tabs/Tabs'
import { useToastError } from '~/hooks/useToastError'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/admin/dashboard/benefits',
    })
  }

  return json({
    benefitId,
  })
}

export default function UpdateBenefitRoute() {
  const { benefitId } = useLoaderData<typeof loader>()

  const tabItems: TabItem[] = [
    {
      title: 'Datos del beneficio',
      path: `/admin/dashboard/benefits/${benefitId}/details`,
    },
    {
      title: 'Subproductos',
      path: `/admin/dashboard/benefits/${benefitId}/subproducts`,
    },
    {
      title: 'Consumo',
      path: `/admin/dashboard/benefits/${benefitId}/consumptions`,
    },
  ]

  return (
    <Container>
      <Link
        to="/admin/dashboard/benefits"
        className="mb-10 ml-auto flex gap-3 font-medium text-cyan-600"
      >
        <AiOutlineArrowLeft className="text-2xl" />
        <span className="tracking-widest">Regresar</span>
      </Link>

      <Tabs items={tabItems} />

      <Outlet context={benefitId} />
    </Container>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
