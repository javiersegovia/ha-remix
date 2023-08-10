import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { requireAdminUserId } from '~/session.server'
import { json } from '@remix-run/node'
import { getMeasures } from '~/services/measurer/measurer.server'
import { useLoaderData, useOutlet } from '@remix-run/react'
import { Container } from '~/components/Layout/Container'
import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { DataTable } from '~/components/Table/DataTable'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { AnimatePresence } from 'framer-motion'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Medidores | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const measures = await getMeasures()

  return json({
    measures,
  })
}

export default function MeasurerIndexRoute() {
  const { measures } = useLoaderData<typeof loader>()

  const outlet = useOutlet()

  return (
    <>
      <Container className="w-full pb-10">
        {measures.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Medidores"
              actions={
                <>
                  <Button
                    className="flex w-full items-center whitespace-nowrap sm:w-auto"
                    href="/people/create"
                    size="SM"
                    icon={ButtonIconVariants.CREATE}
                  >
                    Crear medidor
                  </Button>
                </>
              }
            />
            <DataTable
              columns={columns}
              data={measures}
              tableActions={(table) => <TableActions table={table} />}
            />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún medidor"
            description="¿Qué esperas para añadir el primero?"
            actions={
              <Button
                href="admin/dashboard/data/measurer/create"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear medidor
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
