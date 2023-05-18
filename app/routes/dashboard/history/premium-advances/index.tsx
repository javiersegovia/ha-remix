import type { MetaFunction, LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { getPremiumAdvances } from '~/services/premium-advance/premium-advance.server'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { formatMoney } from '~/utils/formatMoney'
import { formatDate } from '~/utils/formatDate'
import { AdvanceStatusPill } from '~/components/Pills/AdvanceStatusPill'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')
  const premiumAdvanceCount = await prisma.premiumAdvance.count({
    where: {
      employeeId: employee.id,
    },
  })
  const { itemsPerPage } = constants

  const premiumAdvances = await getPremiumAdvances(
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
    premiumAdvances,
    pagination: {
      currentPage,
      totalPages: Math.ceil(premiumAdvanceCount / itemsPerPage),
    },
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Tus adelantos de nómina | HoyTrabajas Beneficios',
  }
}

export default function PremiumAdvancesIndexRoute() {
  const { premiumAdvances, pagination } = useLoaderData<typeof loader>()
  const headings = [
    'Colaborador',
    'Dinero solicitado',
    'Total solicitado',
    'Fecha de solicitud',
    'Estado',
  ]

  const rows: TableRowProps[] = premiumAdvances?.map(
    ({
      employee,
      id,
      requestedAmount,
      status,
      createdAt,
      totalAmount,
      company,
    }) => ({
      rowId: id,
      href: `/dashboard/premium-advances/${id}`,
      items: [
        <>
          <span className="whitespace-pre-wrap" key={`${id}_name`}>
            {(employee?.user.firstName || employee?.user.lastName) && (
              <div className="text-sm font-medium text-cyan-600 underline hover:text-cyan-800">
                {`${employee?.user.firstName} ${employee?.user.lastName}`.trim()}
              </div>
            )}
            <div className="font-normal text-gray-500 ">
              {employee?.user.email}
            </div>
            <div className="text-sm font-medium text-gray-500 ">
              {company.name}
            </div>
          </span>
        </>,
        <div className="text-sm text-gray-900" key={`${id}_requestedAmount`}>
          {formatMoney(`${requestedAmount}`, CurrencySymbol.COP)}
        </div>,
        <div className="text-sm text-gray-900" key={`${id}_totalAmount`}>
          {formatMoney(`${totalAmount}`, CurrencySymbol.COP)}
        </div>,
        <div className="text-sm text-gray-900" key={`${id}_createdAt`}>
          {formatDate(new Date(Date.parse(`${createdAt}`)))}
        </div>,
        <span key={`${id}_status`}>
          <AdvanceStatusPill status={status} />
        </span>,
      ],
    })
  )

  return (
    <>
      {premiumAdvances?.length > 0 ? (
        <>
          <div className="my-8 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Title className="my-3 ml-1 flex-1 whitespace-nowrap text-center lg:text-left">
              Adelantos de Prima
            </Title>
          </div>

          <Table headings={headings} rows={rows} pagination={pagination} />
        </>
      ) : (
        <section className="m-auto mt-10 flex flex-col items-center justify-center pb-20 text-center">
          <Title as="h1">Todavía no posees solicitudes</Title>
        </section>
      )}
    </>
  )
}
