import { PermissionCode } from '@prisma/client'
import { redirect, type ActionArgs } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { deleteIndicatorActivityById } from '~/services/indicator-activity/indicator-activity.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'

const { MANAGE_INDICATOR_ACTIVITY } = PermissionCode

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)
  await requirePermissionByUserId(employee.userId, MANAGE_INDICATOR_ACTIVITY)

  const { indicatorActivityId } = params

  const onCloseRedirectTo = $path('/activity')

  if (!indicatorActivityId || isNaN(Number(indicatorActivityId))) {
    throw badRequest({
      message: 'No se encontró el ID de la actividad de indicador',
      redirect: onCloseRedirectTo,
    })
  }

  await deleteIndicatorActivityById(Number(indicatorActivityId))

  return redirect(onCloseRedirectTo)
}
