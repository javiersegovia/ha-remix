import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { useFetcher, useLoaderData } from '@remix-run/react'

import { ValidatedForm } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { FaHandHolding, FaHandHoldingUsd } from 'react-icons/fa'
import { RiMoneyDollarCircleLine } from 'react-icons/ri'
import { json } from '@remix-run/node'

import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { getLastPaymentMonths } from '~/utils/paymentMonths'
import { getMonthlyOverview } from '~/services/payroll-advance/payroll-advance.server'
import { formatMoney } from '~/utils/formatMoney'
import { Box } from '~/components/Layout/Box'
import { Select } from '~/components/FormFields/Select'
import { PaymentDayList } from '~/components/Lists/PaymentDaysList'
import { Container } from '~/components/Layout/Container'
import { useEffect } from 'react'

const validator = withZod(z.object({ month: z.string() }))

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Resumen | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  const url = new URL(request.url)
  const month = url.searchParams.get('month')
  const lastPaymentMonths = getLastPaymentMonths()
  const data = await getMonthlyOverview(month || lastPaymentMonths[0].id)

  return json({ ...data, lastPaymentMonths })
}

export default function AdminDashboardIndexRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof loader>()

  const { overview, requestDays, lastPaymentMonths } =
    fetcher?.data || loaderData

  useEffect(() => {
    if (fetcher.type === 'init') {
      fetcher.load(`/admin/dashboard?index&month=${lastPaymentMonths[0]?.id}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher])

  return (
    <>
      <Container>
        <div className="my-2 flex flex-col items-center justify-between gap-6 lg:flex-row">
          <Title as="h1">Resumen del mes (Nómina)</Title>

          <div className="w-full md:w-72">
            <ValidatedForm
              validator={validator}
              id="MonthRangeId"
              defaultValues={{
                month: lastPaymentMonths[0]?.id,
              }}
            >
              <Select
                name="month"
                options={lastPaymentMonths}
                onSelectChange={(newValue) => {
                  if (newValue) {
                    fetcher.submit(
                      { month: String(newValue) },
                      { method: 'get' }
                    )
                  }
                }}
              />
            </ValidatedForm>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          <Box className="flex flex-col items-center p-4 sm:p-6">
            <RiMoneyDollarCircleLine className="mb-3 text-5xl text-blue-500" />

            <p className="letter-spacing[1px] mb-2 text-center text-sm font-semibold">
              Cantidad de solicitudes
            </p>

            <div className="space-y-1 font-semibold text-gray-700">
              <p className="text-xs text-yellow-600">
                {overview?.REQUESTED} pendientes
              </p>
              <p className="text-xs text-blue-700">
                {overview?.APPROVED} aprobadas
              </p>
              <p className="text-xs text-green-600">
                {overview?.PAID} desembolsadas
              </p>
              <p className="text-xs text-red-600">
                {overview?.DENIED} denegadas
              </p>
              <p className="text-xs text-orange-600">
                {overview?.CANCELLED} canceladas
              </p>
            </div>
          </Box>

          <Box className="flex flex-col items-center p-6">
            <FaHandHolding className="mb-3 text-5xl text-yellow-500" />

            <p className="letter-spacing[1px] mb-2 text-center text-sm font-semibold">
              Total solicitado
            </p>

            <div className="text-center text-gray-700">
              <p className="text-xs font-medium">
                {formatMoney(
                  overview?.totalRequested.BANK_ACCOUNT || 0,
                  CurrencySymbol.COP
                )}
              </p>

              {overview?.totalRequested?.WALLET > 0 && (
                <p className="text-xs font-medium">
                  {formatMoney(
                    overview?.totalRequested.WALLET || 0,
                    CurrencySymbol.BUSD
                  )}
                </p>
              )}
            </div>
          </Box>

          <Box className="flex flex-col items-center p-6">
            <FaHandHoldingUsd className="mb-3 text-5xl text-green-600" />
            <p className="letter-spacing[1px] mb-2 text-center text-sm font-semibold">
              Total desembolsado
            </p>

            <div className="text-center text-gray-700">
              <p className="text-xs font-medium">
                {formatMoney(
                  overview?.totalPaid.BANK_ACCOUNT || 0,
                  CurrencySymbol.COP
                )}
              </p>

              {overview?.totalRequested?.WALLET > 0 && (
                <p className="text-xs font-medium">
                  {formatMoney(
                    overview?.totalPaid.WALLET || 0,
                    CurrencySymbol.BUSD
                  )}
                </p>
              )}
            </div>
          </Box>
        </section>

        <div className="pb-8" />

        <PaymentDayList requestDays={requestDays} />
      </Container>
    </>
  )
}
