import type { PropsWithChildren } from 'react'
import type { Company } from '@prisma/client'

import { Title } from '~/components/Typography/Title'
import { Tabs } from '~/components/Tabs/Tabs'
import { Container } from '~/components/Layout/Container'

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
      path: `/admin/dashboard/companies/${company.id}?index`,
    },
    {
      title: 'Colaboradores',
      path: `/admin/dashboard/companies/${company.id}/employees`,
      nestedPaths: [
        `/admin/dashboard/companies/${company.id}/employees/create`,
      ],
    },
    {
      title: 'Novedades',
      path: `/admin/dashboard/companies/${company.id}/debts`,
    },
  ]

  return (
    <>
      <Container className="pb-10">
        <div className="my-8">
          <Title>{company?.name || 'Detalles de compañía'}</Title>
          <p className="mt-1 block text-xs uppercase text-gray-500">
            {company?.id}
          </p>
        </div>

        <Tabs items={navPaths} />

        <div className="col-span-12 mt-10">{children}</div>
      </Container>
    </>
  )
}
