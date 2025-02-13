import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Button } from '~/components/Button'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { getPayrollAdvances } from '~/services/payroll-advance/payroll-advance.server'
import { useMatchesData } from '~/utils/utils'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatDate } from '~/utils/formatDate'
import { AdvanceStatusPill } from '~/components/Pills/AdvanceStatusPill'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')
  const payrollAdvanceCount = await prisma.payrollAdvance.count({
    where: {
      employeeId: employee.id,
    },
  })
  const { itemsPerPage } = constants

  const payrollAdvances = await getPayrollAdvances(
    {
      where: {
        employeeId: employee.id,
      },
    },
    {
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }
  )

  return json({
    payrollAdvances,
    pagination: {
      currentPage,
      totalPages: Math.ceil(payrollAdvanceCount / itemsPerPage),
    },
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Tus adelantos de nómina | HoyTrabajas Beneficios',
  }
}

export default function PayrollAdvancesIndexRoute() {
  const { payrollAdvances, pagination } = useLoaderData<typeof loader>()
  const dashboardData = useMatchesData('routes/dashboard')

  const shouldHideRequestNewPayrollButton =
    dashboardData?.hasOwnProperty('canUsePayrollAdvances') &&
    !dashboardData.canUsePayrollAdvances

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
      href: `/dashboard/payroll-advances/${id}`,
      items: [
        <>
          <span
            className="hover:text-cyan-600whitespace-pre-wrap text-sm font-medium text-gray-900 underline"
            key={`${id}_name`}
          >
            <div className="text-sm font-medium text-gray-900 underline hover:text-cyan-600">
              {`Solicitud de ${employee?.user.firstName} ${employee?.user.lastName}`.trim()}
            </div>
          </span>
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
            <>
              <Title className="ml-1 flex-1 whitespace-nowrap text-center lg:text-left">
                Adelantos de Nómina
              </Title>

              {!shouldHideRequestNewPayrollButton && (
                <div className="mx-auto inline-block w-full sm:w-auto lg:ml-auto">
                  <Button
                    href="/dashboard/payroll-advances/new"
                    className=" w-full md:w-auto"
                  >
                    Solicitar nuevamente
                  </Button>
                </div>
              )}
            </>
          </div>

          <Table headings={headings} rows={rows} pagination={pagination} />
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
