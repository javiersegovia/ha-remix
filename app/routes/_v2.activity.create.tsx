import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { $path } from 'remix-routes'

import { requireEmployee } from '~/session.server'
import { getIndicators } from '~/services/indicator/indicator.server'
import { createIndicatorActivity } from '~/services/indicator-activity/indicator-activity.server'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { IndicatorActivityForm } from '~/components/Forms/IndicatorActivityForm'
import { SubmitButton } from '~/components/SubmitButton'
import { extendedIndicatorActivityValidator } from '~/services/indicator-activity/indicator-activity.schema'
import { validationError } from 'remix-validated-form'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { useToastError } from '~/hooks/useToastError'

export const meta: MetaFunction = () => {
  return {
    title: 'Actividad de Indicadores | HoyTrabajas Beneficios',
  }
}

const { MANAGE_INDICATOR_ACTIVITY } = PermissionCode

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(employee.userId, MANAGE_INDICATOR_ACTIVITY)

  const indicators = await getIndicators()

  return json({ indicators, companyId: employee.companyId })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(employee.userId, MANAGE_INDICATOR_ACTIVITY)

  const formData = await request.formData()

  const { data, submittedData, error } =
    await extendedIndicatorActivityValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  const { indicatorId, ...indicatorActivityData } = data

  await createIndicatorActivity(indicatorActivityData, indicatorId)

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = $path('/activity')

export default function IndicatorActivityCreateRoute() {
  const { indicators, companyId } = useLoaderData<typeof loader>() || {}
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
      <IndicatorActivityForm
        formId={formId}
        companyId={companyId}
        indicators={indicators}
      />
    </AnimatedRightPanel>
  )
}

export const ErrorBoundary = () => {
  useToastError()
  return null
}
