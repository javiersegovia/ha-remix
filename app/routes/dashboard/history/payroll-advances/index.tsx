import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Button } from '~/components/Button'
import { PayrollAdvanceList } from '~/components/Lists/PayrollAdvanceList'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { getPayrollAdvances } from '~/services/payroll-advance/payroll-advance.server'

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

            <div className="mx-auto inline-block w-full sm:w-auto lg:ml-auto">
              <Button
                href="/dashboard/payroll-advances/new"
                className=" w-full md:w-auto"
              >
                Solicitar nuevamente
              </Button>
            </div>
          </div>

          <PayrollAdvanceList payrollAdvances={payrollAdvances} />
        </>
      ) : (
        <section className="m-auto mt-10 flex flex-col items-center justify-center pb-20 text-center">
          <Title as="h1">Todavía no posees solicitudes</Title>
          <Button
            href="/dashboard/payroll-advances/new"
            className="mx-auto mt-4 w-auto"
          >
            Solicitar mi primer adelanto de nómina
          </Button>
        </section>
      )}
    </>
  )
}
