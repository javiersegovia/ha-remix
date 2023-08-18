import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { $path } from 'remix-routes'
import { badRequest } from '~/utils/responses'

import { requireAdminUserId } from '~/session.server'
import { getIndicatorById } from '~/services/indicator/indicator.server'
import {
  createIndicatorActivity,
  getIndicatorActivitiesByIndicatorId,
} from '~/services/indicator-activity/indicator-activity.server'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { IndicatorActivityForm } from '~/components/Forms/IndicatorActivityForm'
import { SubmitButton } from '~/components/SubmitButton'
import { indicatorActivityValidator } from '~/services/indicator-activity/indicator-activity.schema'
import { validationError } from 'remix-validated-form'

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
      redirect: $path('/admin/dashboard/data/indicators'),
    })
  }

  const indicator = await getIndicatorById(Number(indicatorId))
  const indicatorActivities = await getIndicatorActivitiesByIndicatorId(
    Number(indicatorId)
  )

  if (!indicator) {
    throw badRequest({
      message: 'No se encontró el indicador',
      redirect: $path('/admin/dashboard/data/indicators'),
    })
  }

  const onCloseRedirectTo = $path(
    '/admin/dashboard/data/indicators/:indicatorId/activities',
    {
      indicatorId: indicator.id,
    }
  )

  if (!indicatorActivities) {
    throw badRequest({
      message: 'No se encontraron los indicadores de actividad',
      redirect: onCloseRedirectTo,
    })
  }

  return json({ indicator, indicatorActivities, onCloseRedirectTo })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { indicatorId } = params

  if (!indicatorId || isNaN(Number(indicatorId))) {
    throw badRequest({
      message: 'No se encontró el ID del indicador',
      redirect: $path('/admin/dashboard/data/indicators'),
    })
  }

  const formData = await request.formData()

  const { data, submittedData, error } =
    await indicatorActivityValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  const onCloseRedirectTo = $path(
    '/admin/dashboard/data/indicators/:indicatorId/activities',
    {
      indicatorId,
    }
  )

  await createIndicatorActivity(data, Number(indicatorId))

  return redirect(onCloseRedirectTo)
}

export default function IndicatorActivityCreateRoute() {
  const { onCloseRedirectTo } = useLoaderData<typeof loader>() || {}
  const formId = 'CreateIndicatorActivityForm'

  return (
    <AnimatedRightPanel
      title="Crear actividad"
      onCloseRedirectTo={onCloseRedirectTo}
      actions={
        <SubmitButton form={formId} size="SM" className="ml-auto md:w-auto">
          Crear actividad
        </SubmitButton>
      }
    >
      <IndicatorActivityForm formId={formId} />
    </AnimatedRightPanel>
  )
}
