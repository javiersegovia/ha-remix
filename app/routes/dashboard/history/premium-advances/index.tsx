import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'

import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { getPremiumAdvances } from '~/services/premium-advance/premium-advance.server'
import { PremiumAdvanceList } from '~/components/Lists/PremiumAdvanceList'

type LoaderData = {
  premiumAdvances: Awaited<ReturnType<typeof getPremiumAdvances>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const employee = await requireEmployee(request)

  const premiumAdvances = await getPremiumAdvances({
    where: {
      employeeId: employee.id,
    },
  })

  return json<LoaderData>({
    premiumAdvances,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Tus adelantos de nómina | HoyAdelantas',
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

            {/* todo: add request premiumAdvance button */}
            {/* <div className="mx-auto inline-block w-full sm:w-auto lg:ml-auto">
              <Button
                href="/dashboard/overview/request-premium-advance"
                className=" w-full md:w-auto"
              >
                Solicitar nuevo adelanto de prima
              </Button>
            </div> */}
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
