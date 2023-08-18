import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { json } from '@remix-run/node'
import { $path } from 'remix-routes'
import { AnimatePresence } from 'framer-motion'
import { useLoaderData, useOutlet } from '@remix-run/react'

import { badRequest } from '~/utils/responses'

import { requireAdminUserId } from '~/session.server'
import { getIndicatorById } from '~/services/indicator/indicator.server'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { getIndicatorActivitiesByIndicatorId } from '~/services/indicator-activity/indicator-activity.server'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { GoBack } from '~/components/Button/GoBack'
import { Table } from '~/components/Lists/Table'
import { formatDate, sanitizeDate } from '~/utils/formatDate'

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

  return json({ indicator, indicatorId, indicatorActivities })
}

const onCloseRedirectTo = $path('/admin/dashboard/data/indicators')

export default function IndicatorActivityIndexRoute() {
  const { indicator, indicatorId, indicatorActivities } =
    useLoaderData<typeof loader>() || {}

  const outlet = useOutlet()

  const headings = ['Colaborador', 'Valor', 'Fecha', '']

  const rows: TableRowProps[] = indicatorActivities?.map((iActivity) => ({
    rowId: iActivity.id,

    items: [
      <div key="name" className="whitespace-pre-line">
        <p>{iActivity.employee.user.fullName}</p>
        <p className="block text-gray-500">{iActivity.employee.user.email}</p>
      </div>,

      iActivity.value,

      formatDate(sanitizeDate(new Date(Date.parse(iActivity.date))) as Date),
      <Button
        key={indicator.id}
        href={$path(
          '/admin/dashboard/data/indicators/:indicatorId/activities/:indicatorActivityId',
          {
            indicatorId,
            indicatorActivityId: iActivity.id,
          }
        )}
        size="XS"
        className="ml-auto w-auto"
        variant={ButtonColorVariants.SECONDARY}
      >
        Editar
      </Button>,
    ],
  }))

  return (
    <>
      <Container>
        <GoBack redirectTo={$path('/admin/dashboard/data/indicators')} />

        {indicatorActivities?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title={`Actividad de ${indicator.name}`}
              actions={
                <>
                  <Button
                    className="flex w-full items-center whitespace-nowrap sm:w-auto"
                    size="SM"
                    href="upload"
                    variant={ButtonColorVariants.SECONDARY}
                    icon={ButtonIconVariants.UPLOAD}
                  >
                    Cargar
                  </Button>

                  <Button href="create" size="SM" className="whitespace-nowrap">
                    Crear actividad
                  </Button>
                </>
              }
            />

            <Table headings={headings} rows={rows} />
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
