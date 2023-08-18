import { redirect, type ActionArgs } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { deleteIndicatorActivityById } from '~/services/indicator-activity/indicator-activity.server'
import { requireAdminUserId } from '~/session.server'
import { badRequest } from '~/utils/responses'

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { indicatorId, indicatorActivityId } = params

  if (!indicatorId || isNaN(Number(indicatorId))) {
    throw badRequest({
      message: 'No se encontró el ID del indicador',
      redirect: $path('/admin/dashboard/data/indicators'),
    })
  }

  const onCloseRedirectTo = $path(
    '/admin/dashboard/data/indicators/:indicatorId/activities',
    {
      indicatorId,
    }
  )

  if (!indicatorActivityId || isNaN(Number(indicatorActivityId))) {
    throw badRequest({
      message: 'No se encontró el ID de la actividad de indicador',
      redirect: onCloseRedirectTo,
    })
  }

  await deleteIndicatorActivityById(Number(indicatorActivityId))

  return redirect(onCloseRedirectTo)
}
