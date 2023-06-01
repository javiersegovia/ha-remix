import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getCompanies } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'
import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Container } from '~/components/Layout/Container'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'
import { CompanyStatusPill } from '~/components/Pills/CompanyStatusPill'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Lista de compañías | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')
  const companyCount = await prisma.company.count()
  const { itemsPerPage } = constants

  return json({
    companies: await getCompanies({
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }),
    pagination: {
      currentPage,
      totalPages: Math.ceil(companyCount / itemsPerPage),
    },
  })
}

export default function CompanyIndexRoute() {
  const { companies, pagination } = useLoaderData<typeof loader>()

  const headings = ['Nombre de la empresa', 'Número de empleados', 'Estado']

  const rows: TableRowProps[] = companies?.map(
    ({ id, name, _count, status }) => ({
      rowId: id,
      href: `${id}?index`,
      items: [
        <>
          <span
            className="whitespace-pre-wrap  text-sm font-medium text-gray-900 hover:text-cyan-600 hover:underline"
            key={`${id}_name`}
          >
            {name}
          </span>
        </>,
        _count.employees > 0 ? (
          <span className="whitespace-pre-wrap" key={`${id}_city`}>
            {_count.employees}
          </span>
        ) : (
          '-'
        ),
        <span className="whitespace-pre-wrap" key={`${id}_status`}>
          <CompanyStatusPill companyStatus={status} />
        </span>,
      ],
    })
  )

  return (
    <Container>
      <TitleWithActions
        title="Compañías"
        className="mb-10"
        actions={
          <Button
            href="/admin/dashboard/companies/create"
            className="flex items-center px-4"
            size="SM"
            icon={ButtonIconVariants.CREATE}
          >
            Crear compañía
          </Button>
        }
      />

      {companies?.length > 0 ? (
        <Table headings={headings} rows={rows} pagination={pagination} />
      ) : (
        <p>No se han encontrado compañías</p>
      )}
    </Container>
  )
}
