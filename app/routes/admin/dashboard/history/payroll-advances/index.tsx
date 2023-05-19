import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { getPayrollAdvances } from '~/services/payroll-advance/payroll-advance.server'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'
import { Table } from '~/components/Lists/Table'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatDate } from '~/utils/formatDate'
import { AdvanceStatusPill } from '~/components/Pills/AdvanceStatusPill'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')
  const payrollAdvanceCount = await prisma.payrollAdvance.count()
  const { itemsPerPage } = constants

  return json({
    payrollAdvances: await getPayrollAdvances(undefined, {
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }),
    pagination: {
      currentPage,
      totalPages: Math.ceil(payrollAdvanceCount / itemsPerPage),
    },
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Lista de adelantos de nómina | HoyTrabajas Beneficios',
  }
}

export default function AdminPayrollAdvancesIndexRoute() {
  const { payrollAdvances, pagination } = useLoaderData<typeof loader>()
  const headings = [
    'Asunto',
    'Dinero solicitado',
    'Total solicitado',
    'Fecha de solicitud',
    'Estado',
  ]
  const rows: TableRowProps[] = payrollAdvances?.map(
    ({ id, employee, company, ...payrollAdvance }) => ({
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
          {formatMoney(payrollAdvance.requestedAmount, CurrencySymbol.COP)}
        </div>,

        <div className="text-sm text-gray-900" key={`${id}_totalAmount`}>
          {formatMoney(payrollAdvance.totalAmount, CurrencySymbol.COP)}
        </div>,

        <div className="text-sm text-gray-900" key={`${id}_createdAt`}>
          {formatDate(new Date(Date.parse(`${payrollAdvance.createdAt}`)))}
        </div>,

        <span key={`${id}_status`}>
          <AdvanceStatusPill status={payrollAdvance.status} />
        </span>,
      ],
    })
  )

  return (
    <>
      {payrollAdvances?.length > 0 ? (
        <>
          <div className="my-8 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Title className="ml-1 flex-1 whitespace-nowrap text-center lg:text-left">
              Adelantos de Nómina
            </Title>
          </div>

          <Table headings={headings} rows={rows} pagination={pagination} />
        </>
      ) : (
        <section className="m-auto pb-20 text-center">
          <Title as="h1">No hay solicitudes</Title>
        </section>
      )}
    </>
  )
}
