import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { badRequest, notFound } from 'remix-utils'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'

import { Title } from '~/components/Typography/Title'
import { capitalizeFirstLetter } from '~/utils/capitalizeFirstLetter'
import { requireAdminUserId } from '~/session.server'
import { json } from '@remix-run/server-runtime'
import { getCompanyDebtById } from '~/services/company-debt/company-debt.server'
import { Box } from '~/components/Layout/Box'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { Button } from '~/components/Button'
import { PayrollAdvanceList } from '~/components/Lists/PayrollAdvanceList'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { companyDebtId } = params

  if (!companyDebtId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del adelanto de nómina',
    })
  }

  const companyDebt = await getCompanyDebtById(companyDebtId)

  if (!companyDebt) {
    throw notFound({
      message: 'No se ha encontrado información sobre el adelanto de nómina',
    })
  }

  const cryptoRelatedList = companyDebt.cryptoDebt?.payrollAdvances || []
  const fiatRelatedList = companyDebt.fiatDebt?.payrollAdvances || []
  const relatedPayrollAdvances = [...fiatRelatedList, ...cryptoRelatedList]

  return json({
    companyDebt,
    relatedPayrollAdvances,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Ha ocurrido un error | HoyAdelantas',
    }
  }

  const { companyDebt } = data

  const date = new Date(Date.parse(`${companyDebt.createdAt}`))
  const monthName = capitalizeFirstLetter(
    format(date, 'LLLL, yyyy', { locale: es })
  )

  return {
    title: `Novedades de ${monthName} | HoyAdelantas`,
  }
}

export default function AdminCompanyDebtDetailsRoute() {
  const { companyDebt, relatedPayrollAdvances } = useLoaderData<typeof loader>()

  const date = new Date(Date.parse(companyDebt.createdAt))
  const monthName = capitalizeFirstLetter(
    format(date, 'LLLL, yyyy', { locale: es })
  )

  return (
    <>
      <div className="mx-auto mt-8 w-full max-w-screen-lg">
        <div className="pb-10">
          <Title>Novedades de {monthName}</Title>
          <Link
            to={`/admin/dashboard/companies/${companyDebt.companyId}`}
            className="cursor-pointer font-medium text-gray-900 underline"
          >
            {companyDebt.company.name}
          </Link>
        </div>

        <div className="flex w-full flex-col">
          <Box className="w-full space-y-2 p-6">
            {companyDebt.fiatDebt && (
              <div>
                <Title as="h4">Novedades de monedas fiat</Title>
                <SummaryItem
                  label="Monto total"
                  value={formatMoney(
                    companyDebt.fiatDebt.amount,
                    CurrencySymbol.COP
                  )}
                />

                <SummaryItem
                  label="Monto actual"
                  value={
                    (companyDebt.fiatDebt.currentAmount &&
                      formatMoney(
                        companyDebt.fiatDebt.currentAmount,
                        CurrencySymbol.COP
                      )) ||
                    'Sin montos pendientes'
                  }
                />
              </div>
            )}

            {companyDebt.cryptoDebt && (
              <div>
                <Title as="h4">Novedades de criptomonedas</Title>
                <SummaryItem
                  label="Monto total"
                  value={formatMoney(
                    companyDebt.cryptoDebt.amount,
                    CurrencySymbol.BUSD
                  )}
                />

                <SummaryItem
                  label="Monto actual"
                  value={
                    (companyDebt.cryptoDebt.currentAmount &&
                      formatMoney(
                        companyDebt.cryptoDebt.currentAmount,
                        CurrencySymbol.BUSD
                      )) ||
                    'Sin montos pendientes'
                  }
                />
              </div>
            )}
          </Box>

          <div className="ml-auto mt-6">
            <Button href="edit">Modificar novedades</Button>
          </div>

          <Title className="mb-8 mt-4">Adelantos relacionados</Title>

          <PayrollAdvanceList
            isAdmin
            payrollAdvances={relatedPayrollAdvances}
            hideColumns={{
              status: true,
            }}
          />
        </div>
      </div>

      <Outlet />
    </>
  )
}

interface SummaryItemProps {
  label: string
  value: string | number | null
}

const SummaryItem = ({ label, value }: SummaryItemProps) => (
  <div className="flex items-center justify-between">
    <div className="font-medium">{label}</div>
    <div className="text-gray-700">{value || '-'}</div>
  </div>
)
