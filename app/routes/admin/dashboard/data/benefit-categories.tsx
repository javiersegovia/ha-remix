import type { LoaderFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getBenefitCategories } from '~/services/benefit-category/benefit-category.server'
import { requireAdminUserId } from '~/session.server'

type LoaderData = {
  benefitCategories: Awaited<ReturnType<typeof getBenefitCategories>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const benefitCategories = await getBenefitCategories()

  return json<LoaderData>({
    benefitCategories,
  })
}

export default function BenefitCategoriesIndexRoute() {
  const { benefitCategories } = useLoaderData<LoaderData>()

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
              Crear categoría
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
