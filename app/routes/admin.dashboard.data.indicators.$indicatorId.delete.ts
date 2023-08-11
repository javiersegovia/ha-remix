import { redirect, type ActionArgs } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { deleteIndicatorById } from '~/services/indicator/indicator.server'
import { requireAdminUserId } from '~/session.server'
import { badRequest } from '~/utils/responses'

const redirectTo = $path('/admin/dashboard/data/indicators')

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { indicatorId } = params

  if (!indicatorId || isNaN(Number(indicatorId))) {
    throw badRequest({
      message: 'No se encontró el ID del indicador',
      redirect: redirectTo,
    })
  }
  await deleteIndicatorById(Number(indicatorId))

  return redirect(redirectTo)
}
