import type { MetaFunction, LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { getPremiumAdvances } from '~/services/premium-advance/premium-advance.server'
import { PremiumAdvanceList } from '~/components/Lists/PremiumAdvanceList'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const premiumAdvances = await getPremiumAdvances({
    where: {
      employeeId: employee.id,
    },
  })

  return json({
    premiumAdvances,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Tus adelantos de nómina | HoyAdelantas',
  }
}

export default function PremiumAdvancesIndexRoute() {
  const { premiumAdvances } = useLoaderData<typeof loader>()

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

          <PremiumAdvanceList premiumAdvances={premiumAdvances} />
        </>
      ) : (
        <section className="m-auto mt-10 flex flex-col items-center justify-center pb-20 text-center">
          <Title as="h1">Todavía no posees solicitudes</Title>
        </section>
      )}
    </>
  )
}
