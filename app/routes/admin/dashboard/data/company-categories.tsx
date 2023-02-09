import type { LoaderFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '../../../../components/Lists/Table'

import React from 'react'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { requireAdminUserId } from '~/session.server'
import { json } from '@remix-run/node'
import { Table } from '~/components/Lists/Table'
import { getCompanyCategories } from '../../../../services/company-category/company-category.server'

type LoaderData = {
  companyCategories: Awaited<ReturnType<typeof getCompanyCategories>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const companyCategories = await getCompanyCategories()

  return json<LoaderData>({
    companyCategories,
  })
}

export default function CompanyCategoryIndexRoute() {
  const { companyCategories } = useLoaderData<LoaderData>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = companyCategories?.map((companyCategories) => ({
    rowId: companyCategories.id,
    href: `/admin/dashboard/data/company-categories/${companyCategories.id}`,
    items: [companyCategories.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Categoría de compañías"
          actions={
            <Button href="create" size="SM">
              Crear categoría de compañía
            </Button>
          }
        />
        {companyCategories?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado categorías de compañías</p>
        )}
      </Container>
      <Outlet />
    </>
  )
}
