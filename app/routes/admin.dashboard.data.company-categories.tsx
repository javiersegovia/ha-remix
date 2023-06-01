import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { getCompanyCategories } from '~/services/company-category/company-category.server'
import { requireAdminUserId } from '~/session.server'
import { Table } from '~/components/Lists/Table'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const companyCategories = await getCompanyCategories()

  return json({
    companyCategories,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Categorías de Compañías | HoyAdelantas',
  }
}

export default function CompanyCategoryIndexRoute() {
  const { companyCategories } = useLoaderData<typeof loader>()

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
