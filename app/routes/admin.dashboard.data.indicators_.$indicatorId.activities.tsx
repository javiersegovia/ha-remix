import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { $path } from 'remix-routes'
import { AnimatePresence } from 'framer-motion'
import { useLoaderData, useOutlet } from '@remix-run/react'

import { badRequest } from '~/utils/responses'

import { requireAdminUserId } from '~/session.server'
import { getIndicatorById } from '~/services/indicator/indicator.server'
import { Button, ButtonIconVariants } from '~/components/Button'
import { getIndicatorActivitiesByIndicatorId } from '~/services/indicator-activity/indicator-activity.server'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { GoBack } from '~/components/Button/GoBack'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Actividad de Indicador | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { indicatorId } = params

  if (!indicatorId || isNaN(Number(indicatorId))) {
    throw badRequest({
      message: 'No se encontró el ID del indicador',
      redirect: onCloseRedirectTo,
    })
  }

  const indicator = await getIndicatorById(Number(indicatorId))
  const indicatorActivities = await getIndicatorActivitiesByIndicatorId(
    Number(indicatorId)
  )

  if (!indicator) {
    throw badRequest({
      message: 'No se encontró el indicador',
      redirect: onCloseRedirectTo,
    })
  }

  if (!indicatorActivities) {
    throw badRequest({
      message: 'No se encontraron los indicadores de actividad',
      redirect: onCloseRedirectTo,
    })
  }

  return json({ indicator, indicatorActivities })
}

const onCloseRedirectTo = $path('/admin/dashboard/data/indicators')

export default function IndicatorActivityIndexRoute() {
  const { indicator, indicatorActivities } =
    useLoaderData<typeof loader>() || {}

  const outlet = useOutlet()

  return (
    <>
      <Container>
        <GoBack redirectTo={$path('/admin/dashboard/data/indicators')} />

        {indicatorActivities?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title={`Actividad de indicador ${indicator.name}`}
              actions={
                <Button href="create" size="SM">
                  Crear actividad
                </Button>
              }
            />

            {/* <Table headings={headings} rows={rows} /> */}
          </>
        ) : (
          <TableIsEmpty
            title={`Aún no tienes ninguna actividad en ${indicator.name}`}
            className="mt-10"
            actions={
              <Button
                href={$path(
                  '/admin/dashboard/data/indicators/:indicatorId/activities/create',
                  { indicatorId: indicator.id }
                )}
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear actividad
              </Button>
            }
          />
        )}
      </Container>

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}
