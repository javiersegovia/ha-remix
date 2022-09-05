import { useFetcher, useLoaderData } from '@remix-run/react'

import { FaHandHolding, FaHandHoldingUsd } from 'react-icons/fa'
import { RiMoneyDollarCircleLine } from 'react-icons/ri'
import { json } from '@remix-run/node'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'

import { Title } from '~/components/Typography/Title'
import type { LoaderFunction } from '@remix-run/server-runtime'
import { requireAdminUserId } from '~/session.server'
import { getLastPaymentMonths } from '~/utils/paymentMonths'
import { getMonthlyOverview } from '~/services/payroll-advance/payroll-advance.server'
import { formatMoney } from '~/utils/formatMoney'
import { Box } from '~/components/Layout/Box'
import { Select } from '~/components/FormFields/Select'
import { Form, useForm } from '~/components/FormFields/Form'
import { PaymentDayList } from '~/components/Lists/PaymentDaysList'

const lastPaymentMonths = getLastPaymentMonths()

type LoaderData = {
  data: Awaited<ReturnType<typeof getMonthlyOverview>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  const url = new URL(request.url)
  const month = url.searchParams.get('month')
  const data = await getMonthlyOverview(month || lastPaymentMonths[0].id)
  return json<LoaderData>({ data })
}

export default function AdminDashboardIndexRoute() {
  const { data: loaderData } = useLoaderData<LoaderData>()

  const fetcher = useFetcher<LoaderData>()
  const formProps = useForm({ method: 'get' })
  const { overview, requestDays } = fetcher?.data?.data || loaderData

  return (
    <>
      <section className="mx-auto w-full max-w-screen-lg">
        <div className="my-2 flex items-center justify-between">
          <Title>Resumen del mes</Title>

          <div className="w-72">
            <Form {...formProps}>
              <Select
                name="month"
                options={lastPaymentMonths}
                defaultSelectValue={lastPaymentMonths[0]}
                onSelectChange={(newValue) => {
                  if (newValue) {
                    fetcher.submit(
                      { month: (newValue as { id: string }).id },
                      { method: 'get' }
                    )
                  }
                }}
              />
            </Form>
          </div>
        </div>

        <section className="grid grid-cols-3 gap-6">
          <Box className="flex flex-col items-center p-6">
            <RiMoneyDollarCircleLine className="mb-3 text-5xl text-blue-500" />
            <p className="letter-spacing[1px] mb-2 text-sm font-semibold">
              Cantidad de solicitudes
            </p>

            <div className="space-y-1 font-semibold text-gray-700">
              <p className="text-xs text-yellow-500">
                {overview?.REQUESTED} pendientes
              </p>
              <p className="text-xs text-purple-600">
                {overview?.APPROVED} aprobadas
              </p>
              <p className="text-xs text-green-600">
                {overview?.PAID} desembolsadas
              </p>
              <p className="text-xs text-red-500">
                {overview?.CANCELLED} canceladas
              </p>
            </div>
          </Box>

          <Box className="flex flex-col items-center p-6">
            <FaHandHolding className="mb-3 text-5xl text-yellow-500" />
            <p className="letter-spacing[1px] mb-2 text-sm font-semibold">
              Total solicitado
            </p>

            <div className="text-center text-gray-700">
              <p className="text-xs font-medium">
                {formatMoney(
                  overview?.totalRequested.BANK_ACCOUNT || 0,
                  CurrencySymbol.COP
                )}
              </p>
              <p className="text-xs font-medium">
                {formatMoney(
                  overview?.totalRequested.WALLET || 0,
                  CurrencySymbol.BUSD
                )}
              </p>
            </div>
          </Box>

          <Box className="flex flex-col items-center p-6">
            <FaHandHoldingUsd className="mb-3 text-5xl text-green-600" />
            <p className="letter-spacing[1px] mb-2 text-sm font-semibold">
              Total desembolsado
            </p>

            <div className="text-center text-gray-700">
              <p className="text-xs font-medium">
                {formatMoney(
                  overview?.totalPaid.BANK_ACCOUNT || 0,
                  CurrencySymbol.COP
                )}
              </p>

              <p className="text-xs font-medium">
                {formatMoney(
                  overview?.totalPaid.WALLET || 0,
                  CurrencySymbol.BUSD
                )}
              </p>
            </div>
          </Box>
        </section>

        <div className="pb-8" />

        <PaymentDayList requestDays={requestDays} />
      </section>
    </>
  )
}
