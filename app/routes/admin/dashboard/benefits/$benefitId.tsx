import type { LoaderFunction } from '@remix-run/server-runtime'
import type { TabItem } from '~/components/Tabs/Tabs'

import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from 'remix-utils'
import { AiOutlineArrowLeft } from 'react-icons/ai'

import { requireAdminUserId } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { Tabs } from '~/components/Tabs/Tabs'

type LoaderData = {
  benefitId: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  return json<LoaderData>({
    benefitId,
  })
}

export default function UpdateBenefitRoute() {
  const { benefitId } = useLoaderData<LoaderData>()

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
        className="ml-auto mb-10 flex gap-3 font-medium text-cyan-600"
      >
        <AiOutlineArrowLeft className="text-2xl" />
        <span className="tracking-widest">Regresar</span>
      </Link>

      <Tabs items={tabItems} />

      <Outlet context={benefitId} />
    </Container>
  )
}
