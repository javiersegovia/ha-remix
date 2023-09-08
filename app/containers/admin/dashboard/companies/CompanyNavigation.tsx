import type { PropsWithChildren } from 'react'
import type { Company } from '@prisma/client'

import { Title } from '~/components/Typography/Title'
import { Tabs } from '~/components/Tabs/Tabs'
import { Container } from '~/components/Layout/Container'
import { $path } from 'remix-routes'

interface CompanyNavigationProps extends PropsWithChildren {
  company: Pick<Company, 'id' | 'name'>
}

export const CompanyNavigation = ({
  company,
  children,
}: CompanyNavigationProps) => {
  const navPaths = [
    {
      title: 'Información principal',
      path: $path(
        '/admin/dashboard/companies/:companyId',
        {
          companyId: company.id,
        },
        { index: true }
      ),
    },
    {
      title: 'Colaboradores',
      path: $path('/admin/dashboard/companies/:companyId/employees', {
        companyId: company.id,
      }),
      nestedPaths: [
        $path('/admin/dashboard/companies/:companyId/employees/create', {
          companyId: company.id,
        }),
      ],
    },
    {
      title: 'Equipos',
      path: $path('/admin/dashboard/companies/:companyId/teams', {
        companyId: company.id,
      }),
    },
    {
      title: 'Puntos',
      path: $path('/admin/dashboard/companies/:companyId/points', {
        companyId: company.id,
      }),
    },
    {
      title: 'Novedades',
      path: $path('/admin/dashboard/companies/:companyId/debts', {
        companyId: company.id,
      }),
    },
  ]

  return (
    <>
      <Container className="pb-10">
        <div className="my-8">
          <Title>{company?.name || 'Detalles de compañía'}</Title>
        </div>

        <Tabs items={navPaths} />

        <div className="col-span-12 mt-10">{children}</div>
      </Container>
    </>
  )
}
