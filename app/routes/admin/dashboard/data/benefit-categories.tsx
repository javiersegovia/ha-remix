import type { LoaderArgs } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getBenefitCategories } from '~/services/benefit-category/benefit-category.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const benefitCategories = await getBenefitCategories()

  return json({
    benefitCategories,
  })
}

export default function BenefitCategoriesIndexRoute() {
  const { benefitCategories } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = benefitCategories?.map((benefitCategory) => ({
    rowId: benefitCategory.id,
    href: `/admin/dashboard/data/benefit-categories/${benefitCategory.id}`,
    items: [benefitCategory.name],
  }))

  return (
    <>
      <Container>
        <TitleWithActions
          className="mb-10"
          title="Categorías de beneficios"
          actions={
            <Button href="create" size="SM">
              Crear categoría de beneficio
            </Button>
          }
        />

        {benefitCategories?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p>No se han encontrado categorías de beneficios.</p>
        )}
      </Container>

      <Outlet />
    </>
  )
}
