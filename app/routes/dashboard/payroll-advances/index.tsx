import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Button } from '~/components/Button'
import { PayrollAdvanceList } from '~/components/Lists/PayrollAdvanceList'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { getPayrollAdvances } from '~/services/payroll-advance/payroll-advance.server'

import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'

type LoaderData = {
  payrollAdvances: Awaited<ReturnType<typeof getPayrollAdvances>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const employee = await requireEmployee(request)

  const payrollAdvances = await getPayrollAdvances({
    where: {
      employeeId: employee.id,
    },
  })

  return json<LoaderData>({
    payrollAdvances,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Tus adelantos de nómina | HoyAdelantas',
  }
}

export default function PayrollAdvancesIndexRoute() {
  const { payrollAdvances } = useLoaderData<LoaderData>()

  return (
    <div className="p-2 sm:p-8">
      {payrollAdvances?.length > 0 ? (
        <>
          <div className="mb-8 mt-2 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Title
              as="h1"
              className="flex-1 whitespace-nowrap text-center lg:text-left"
            >
              Mis movimientos
            </Title>

            <div className="mx-auto inline-block w-full sm:w-auto lg:ml-auto">
              <Button href="new" className=" w-full md:w-auto">
                Solicitar nuevo adelanto
              </Button>
            </div>
          </div>
          <PayrollAdvanceList payrollAdvances={payrollAdvances} />
        </>
      ) : (
        <section className="m-auto pb-20 text-center">
          <Title as="h1">Todavía no posees solicitudes</Title>
          <Button href="new" className="mt-4 w-auto">
            Solicitar mi primer adelanto de nómina
          </Button>
        </section>
      )}
    </div>
  )
}
