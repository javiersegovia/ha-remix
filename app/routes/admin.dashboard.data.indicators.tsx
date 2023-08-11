import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { useLoaderData, useOutlet } from '@remix-run/react'
import { json } from '@remix-run/node'

import { Button, ButtonIconVariants } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Table } from '~/components/Lists/Table'
import { requireAdminUserId } from '~/session.server'
import { getIndicators } from '~/services/indicator/indicator.server'
import { $path } from 'remix-routes'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { AnimatePresence } from 'framer-motion'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const indicators = await getIndicators()

  return json({
    indicators,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Indicadores | HoyTrabajas Beneficios',
  }
}

export default function IndicatorIndexRoute() {
  const { indicators } = useLoaderData<typeof loader>()

  const outlet = useOutlet()

  const headings = ['Nombre']

  const rows: TableRowProps[] = indicators?.map((indicator) => ({
    rowId: indicator.id,
    href: $path('/admin/dashboard/data/indicators/:indicatorId', {
      indicatorId: indicator.id,
    }),
    items: [indicator.name],
  }))

  return (
    <>
      <Container>
        {indicators?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Indicadores de progreso"
              actions={
                <Button href="create" size="SM">
                  Crear indicador
                </Button>
              }
            />
            <Table headings={headings} rows={rows} />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún indicador"
            description="¿Qué esperas para añadir el primero?"
            actions={
              <Button
                href={$path('/admin/dashboard/data/indicators/create')}
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear indicador
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}
