import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableProps, TableRowProps } from '~/components/Lists/Table'
import type { ExtractRemixResponse } from '~/utils/type-helpers'

import { Container } from '~/components/Layout/Container'
import { Table } from '~/components/Lists/Table'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'
import { json } from '@remix-run/node'
import { prisma } from '~/db.server'
import { useLoaderData } from '@remix-run/react'

const headings: TableProps['headings'] = ['Nombre', 'Resultados']

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Data | HoyAdelantas',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const [
    banks,
    benefitCategories,
    jobPositions,
    jobDepartments,
    companyCategories,
    cities,
    states,
    genders,
    currencies,
    countries,
    bankAccountTypes,
    identityDocumentTypes,
  ] = await Promise.all([
    prisma.bank.count(),
    prisma.benefitCategory.count(),
    prisma.jobPosition.count(),
    prisma.jobDepartment.count(),
    prisma.companyCategory.count(),
    prisma.city.count(),
    prisma.state.count(),
    prisma.gender.count(),
    prisma.currency.count(),
    prisma.country.count(),
    prisma.bankAccountType.count(),
    prisma.identityDocumentType.count(),
  ])

  const rows: TableRowProps[] = [
    {
      rowId: 'job-departments',
      items: ['Áreas de trabajo', jobDepartments],
      href: '/admin/dashboard/data/job-departments',
    },
    {
      rowId: 'banks',
      items: ['Bancos', banks],
      href: '/admin/dashboard/data/banks',
    },
    {
      rowId: 'job-positions',
      items: ['Cargos de trabajo', jobPositions],
      href: '/admin/dashboard/data/job-positions',
    },
    {
      rowId: 'company-categories',
      items: ['Categorías de compañías', companyCategories],
      href: '/admin/dashboard/data/company-categories',
    },
    {
      rowId: 'benefit-categories',
      items: ['Categorías de beneficios', benefitCategories],
      href: '/admin/dashboard/data/benefit-categories',
    },
    {
      rowId: 'cities',
      items: ['Ciudades', cities],
      href: '/admin/dashboard/data/cities',
      isDisabled: true,
    },
    {
      rowId: 'states',
      items: ['Estados', states],
      href: '/admin/dashboard/data/states',
      isDisabled: true,
    },
    {
      rowId: 'genders',
      items: ['Géneros', genders],
      href: '/admin/dashboard/data/genders',
    },
    {
      rowId: 'currencies',
      items: ['Monedas', currencies],
      href: '/admin/dashboard/data/currencies',
      isDisabled: true,
    },
    {
      rowId: 'countries',
      items: ['Países', countries],
      href: '/admin/dashboard/data/countries',
      isDisabled: true,
    },
    {
      rowId: 'bank-account-types',
      items: ['Tipos de cuenta bancaria', bankAccountTypes],
      href: '/admin/dashboard/data/bank-account-types',
      isDisabled: true,
    },
    {
      rowId: 'identity-document-types',
      items: ['Tipos de documento de identidad', identityDocumentTypes],
      href: '/admin/dashboard/data/identity-document-types',
      isDisabled: true,
    },
  ]

  return json({
    rows,
  })
}

const AdminDashboardDataIndexRoute = () => {
  const { rows } = useLoaderData<typeof loader>()

  return (
    <Container>
      <div className="mb-8 mt-2 flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
        <Title>Modelos de la Base de Datos</Title>
      </div>

      <Table
        headings={headings}
        rows={rows as ExtractRemixResponse<typeof loader>['rows']}
      />
    </Container>
  )
}

export default AdminDashboardDataIndexRoute
