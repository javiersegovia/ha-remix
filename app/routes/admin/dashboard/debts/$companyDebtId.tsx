import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'

import { badRequest, notFound } from '~/utils/responses'
import { Title } from '~/components/Typography/Title'
import { capitalizeFirstLetter } from '~/utils/capitalizeFirstLetter'
import { requireAdminUserId } from '~/session.server'
import { getCompanyDebtById } from '~/services/company-debt/company-debt.server'
import { Box } from '~/components/Layout/Box'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { Button } from '~/components/Button'
import { Table } from '~/components/Lists/Table'
import { constants } from '~/config/constants'
import { formatDate } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { prisma } from '~/db.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyDebtId } = params
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')

  if (!companyDebtId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la novedad',
      redirect: '/admin/dashboard',
    })
  }

  const companyDebt = await getCompanyDebtById(companyDebtId)
  if (!companyDebt) {
    throw notFound({
      message: 'No se ha encontrado información sobre la novedad',
      redirect: '/admin/dashboard/debts',
    })
  }

  const dataCount = await prisma.payrollAdvance.count({
    where: {
      OR: [
        {
          companyFiatDebtId: companyDebt.fiatDebt?.id,
        },
        {
          companyCryptoDebtId: companyDebt.cryptoDebt?.id,
        },
      ],
    },
  })
  const { itemsPerPage } = constants

  const payrollAdvances = await prisma.payrollAdvance.findMany({
    where: {
      OR: [
        {
          companyFiatDebtId: companyDebt.fiatDebt?.id,
        },
        {
          companyCryptoDebtId: companyDebt.cryptoDebt?.id,
        },
      ],
    },
    take: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage || 0,
    select: {
      id: true,
      totalAmount: true,
      requestedAmount: true,
      createdAt: true,
      employee: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      company: {
        select: {
          name: true,
        },
      },
    },
  })

  return json({
    companyDebt,
    payrollAdvances,
    pagination: {
      currentPage,
      totalPages: Math.ceil(dataCount / itemsPerPage),
    },
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Ha ocurrido un error | HoyTrabajas Beneficios',
    }
  }

  const { companyDebt } = data

  const date = new Date(Date.parse(`${companyDebt.createdAt}`))
  const monthName = capitalizeFirstLetter(
    format(date, 'LLLL, yyyy', { locale: es })
  )

  return {
    title: `Novedades de ${monthName} | HoyTrabajas Beneficios`,
  }
}

export default function AdminCompanyDebtDetailsRoute() {
  const { companyDebt, pagination, payrollAdvances } =
    useLoaderData<typeof loader>()

  const headings = [
    'Asunto',
    'Dinero solicitado',
    'Total solicitado',
    'Fecha de solicitud',
  ]
  const date = new Date(Date.parse(companyDebt.createdAt))
  const monthName = capitalizeFirstLetter(
    format(date, 'LLLL, yyyy', { locale: es })
  )

  const rows: TableRowProps[] = payrollAdvances.map(
    ({ id, company, employee, totalAmount, requestedAmount, createdAt }) => ({
      rowId: id,
      href: `/admin/dashboard/payroll-advances/${id}`,
      items: [
        <>
          {(employee?.user.firstName || employee?.user.lastName) && (
            <div
              className="text-sm font-medium text-cyan-600  hover:text-cyan-800 hover:underline"
              key={`${id}_name`}
            >
              {`${employee.user.firstName} ${employee.user.lastName}`.trim()}
            </div>
          )}
          <div className="text-sm font-normal text-gray-500">
            {employee?.user.email}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {company?.name}
          </div>
        </>,

        <div className="text-sm text-gray-900" key={`${id}_requestedAmount`}>
          {formatMoney(requestedAmount, CurrencySymbol.COP)}
        </div>,

        <div className="text-sm text-gray-900" key={`${id}_totalAmount`}>
          {formatMoney(totalAmount, CurrencySymbol.COP)}
        </div>,

        <div className="text-sm text-gray-900" key={`${id}_date`}>
          {formatDate(new Date(Date.parse(createdAt)))}
        </div>,
      ],
    })
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

          <Table headings={headings} rows={rows} pagination={pagination} />
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
