import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { getBenefitCategories } from '~/services/benefit-category/benefit-category.server'
import { requireUserId } from '~/session.server'
import { Tabs } from '~/components/Tabs/Tabs'
import { manageBenefitPaths } from './benefits'

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  const benefitCategories = await getBenefitCategories() // todo: check

  return json({
    benefitCategories,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Categorías de Beneficios | HoyTrabajas Beneficios',
  }
}

export default function BenefitCategoriesIndexRoute() {
  const { benefitCategories } = useLoaderData<typeof loader>()

  const headings = ['Nombre']

  const rows: TableRowProps[] = benefitCategories?.map((benefitCategory) => ({
    rowId: benefitCategory.id,
    href: `/dashboard/manage/benefit-categories/${benefitCategory.id}`,
    items: [benefitCategory.name],
  }))

  return (
    <>
      <Container className="w-full">
        <Tabs items={manageBenefitPaths} className="mt-10 mb-8" />

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
