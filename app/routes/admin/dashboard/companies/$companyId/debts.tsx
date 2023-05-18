import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { getCompanyDebtsByCompanyId } from '~/services/company-debt/company-debt.server'
import { requireCompany } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatRelativeDate } from '~/utils/formatDate'
import { Container } from '~/components/Layout/Container'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')

  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
    },
  })

  const debtCount = await prisma.companyDebt.count()
  const { itemsPerPage } = constants

  return json({
    debts: await getCompanyDebtsByCompanyId(company.id, {
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }),
    pagination: {
      currentPage,
      totalPages: Math.ceil(debtCount / itemsPerPage),
    },
    companyName: company.name,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Error | HoyTrabajas Beneficios',
    }
  }

  const { companyName } = data

  return {
    title: `[Admin] Novedades de ${companyName}`,
  }
}

export default function AdminDashboardCompanyDebtsIndexRoute() {
  const { debts, pagination } = useLoaderData<typeof loader>()

  const headings = [
    'Mes',
    'Monto total',
    'Monto actual',
    'Cantidad de adelantos',
    'Última actualización',
  ]

  const rows: TableRowProps[] = debts?.map(
    ({ id, fiatDebt, cryptoDebt, month, year, updatedAt }) => ({
      rowId: id,
      href: `/admin/dashboard/debts/${id}`,
      items: [
        <>
          <span
            className="text-sm font-medium text-gray-900 hover:text-cyan-600 hover:underline"
            key={`${id}_month`}
          >
            Novedades de{' '}
            {format(new Date(year, month - 1), 'MMMM yyyy', {
              locale: es,
            })}
          </span>
        </>,
        <span key={`${id}_amount`}>
          {fiatDebt && (
            <span className="text-sm text-gray-900">
              {formatMoney(fiatDebt.amount, CurrencySymbol.COP)}
            </span>
          )}
          {cryptoDebt && (
            <span className="text-sm text-gray-900">
              {formatMoney(cryptoDebt.amount, CurrencySymbol.BUSD)}
            </span>
          )}
        </span>,
        <span key={`${id}_currentAmount`}>
          {fiatDebt && (
            <div className="text-sm text-gray-900">
              {fiatDebt.currentAmount
                ? formatMoney(fiatDebt.currentAmount, CurrencySymbol.COP)
                : '-'}
            </div>
          )}

          {cryptoDebt && (
            <div className="text-sm text-gray-900">
              {cryptoDebt.currentAmount
                ? formatMoney(cryptoDebt.currentAmount, CurrencySymbol.BUSD)
                : '-'}
            </div>
          )}
        </span>,
        <span key={`${id}_payrollAdvances`}>
          {fiatDebt && (
            <div className="text-sm text-gray-900">
              {fiatDebt._count.payrollAdvances}
            </div>
          )}
          {cryptoDebt && (
            <div className="text-sm text-gray-900">
              {cryptoDebt._count.payrollAdvances}
            </div>
          )}
        </span>,
        <span key={`${id}_updatedAt`}>
          <div className="text-sm text-gray-900">
            {formatRelativeDate(new Date(Date.parse(updatedAt)))}
          </div>
        </span>,
      ],
    })
  )

  return (
    <>
      <Container className="w-full pb-10">
        {debts?.length > 0 ? (
          <Table headings={headings} rows={rows} pagination={pagination} />
        ) : (
          <div className="flex flex-col rounded-[15px] border border-gray-300 py-6">
            <p className="my-6 text-center font-medium text-gray-700">
              La lista de novedades está vacía
            </p>
          </div>
        )}
      </Container>
    </>
  )
}
