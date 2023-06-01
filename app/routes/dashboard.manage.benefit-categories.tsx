import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'

import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Container } from '~/components/Layout/Container'
import { Table } from '~/components/Lists/Table'
import { Tabs } from '~/components/Tabs/Tabs'
import { useToastError } from '~/hooks/useToastError'
import { requireEmployee } from '~/session.server'
import { manageBenefitPaths } from './dashboard.manage.benefits._index'
import { getBenefitCategoriesByCompanyId } from '~/services/benefit-category/benefit-category.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_BENEFIT
  )

  const benefitCategories = await getBenefitCategoriesByCompanyId(
    employee.companyId
  )

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

        {benefitCategories?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Categorías de beneficios"
              actions={
                <Button
                  href="create"
                  size="SM"
                  icon={ButtonIconVariants.CREATE}
                >
                  Crear categoría de beneficio
                </Button>
              }
            />
            <Table headings={headings} rows={rows} />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ninguna categoría"
            description="¿Qué esperas para añadir la primera?"
            actions={
              <Button
                href="/dashboard/manage/benefit-categories/create"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear categoría de beneficio
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>

      <Outlet />
    </>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
