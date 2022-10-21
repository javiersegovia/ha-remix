import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { getPremiumAdvances } from '~/services/premium-advance/premium-advance.server'
import { PremiumAdvanceList } from '~/components/Lists/PremiumAdvanceList'

type LoaderData = {
  premiumAdvances: Awaited<ReturnType<typeof getPremiumAdvances>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const premiumAdvances = await getPremiumAdvances()

  return json<LoaderData>({
    premiumAdvances,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Lista de adelantos de prima | HoyAdelantas',
  }
}

export default function PremiumAdvancesIndexRoute() {
  const { premiumAdvances } = useLoaderData<LoaderData>()

  return (
    <>
      {premiumAdvances?.length > 0 ? (
        <>
          <div className="my-8 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Title
              as="h1"
              className="my-3 ml-1 flex-1 whitespace-nowrap text-center lg:text-left"
            >
              Adelantos de Prima
            </Title>
          </div>

          <PremiumAdvanceList premiumAdvances={premiumAdvances} isAdmin />
        </>
      ) : (
        <section className="m-auto pb-20 text-center">
          <Title as="h1">No hay solicitudes</Title>
        </section>
      )}
    </>
  )
}
