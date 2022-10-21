import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { getPayrollAdvances } from '~/services/payroll-advance/payroll-advance.server'
import { PayrollAdvanceList } from '~/components/Lists/PayrollAdvanceList'

type LoaderData = {
  payrollAdvances: Awaited<ReturnType<typeof getPayrollAdvances>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const payrollAdvances = await getPayrollAdvances()

  return json<LoaderData>({
    payrollAdvances,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Lista de adelantos de nómina | HoyAdelantas',
  }
}

export default function AdminPayrollAdvancesIndexRoute() {
  const { payrollAdvances } = useLoaderData<LoaderData>()

  return (
    <>
      {payrollAdvances?.length > 0 ? (
        <>
          <div className="my-8 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Title
              as="h1"
              className="ml-1 flex-1 whitespace-nowrap text-center lg:text-left"
            >
              Adelantos de Nómina
            </Title>
          </div>

          <PayrollAdvanceList payrollAdvances={payrollAdvances} isAdmin />
        </>
      ) : (
        <section className="m-auto pb-20 text-center">
          <Title as="h1">No hay solicitudes</Title>
        </section>
      )}
    </>
  )
}
