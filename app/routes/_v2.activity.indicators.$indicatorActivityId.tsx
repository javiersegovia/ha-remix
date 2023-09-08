import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { requireEmployee } from '~/session.server'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'

import { $path } from 'remix-routes'
import { SubmitButton } from '~/components/SubmitButton'
import { IndicatorActivityForm } from '~/components/Forms/IndicatorActivityForm'
import {
  getIndicatorActivityById,
  updateIndicatorActivityById,
} from '~/services/indicator-activity/indicator-activity.server'
import { extendedIndicatorActivityValidator } from '~/services/indicator-activity/indicator-activity.schema'
import { parseISOLocalNullable } from '~/utils/formatDate'
import { ButtonColorVariants } from '~/components/Button'
import { getIndicators } from '~/services/indicator/indicator.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'

const { MANAGE_INDICATOR_ACTIVITY } = PermissionCode

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)
  await requirePermissionByUserId(employee.userId, MANAGE_INDICATOR_ACTIVITY)

  const { indicatorActivityId } = params

  if (!indicatorActivityId || isNaN(Number(indicatorActivityId))) {
    throw badRequest({
      message: 'No se encontró el ID de la actividad de indicador',
      redirect: onCloseRedirectTo,
    })
  }

  const indicatorActivity = await getIndicatorActivityById(
    Number(indicatorActivityId)
  )

  if (!indicatorActivity) {
    throw badRequest({
      message: 'No se encontró el indicador',
      redirect: onCloseRedirectTo,
    })
  }

  const indicators = await getIndicators()

  return json({
    indicators,
    companyId: employee.companyId,
    indicatorActivity,
    onCloseRedirectTo,
  })
}

const onCloseRedirectTo = $path('/activity/indicators')

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)
  await requirePermissionByUserId(employee.userId, MANAGE_INDICATOR_ACTIVITY)

  const { indicatorActivityId } = params

  if (!indicatorActivityId || isNaN(Number(indicatorActivityId))) {
    throw badRequest({
      message: 'No se encontró el ID de la actividad de indicador',
      redirect: onCloseRedirectTo,
    })
  }

  const formData = await request.formData()

  const { data, submittedData, error } =
    await extendedIndicatorActivityValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await updateIndicatorActivityById(data, Number(indicatorActivityId))

  return redirect(onCloseRedirectTo)
}

export default function IndicatorActivityUpdateRoute() {
  const { indicators, companyId, indicatorActivity } =
    useLoaderData<typeof loader>() || {}
  const formId = 'UpdateIndicatorActivityForm' as const

  const { value, date, employee, indicatorId } = indicatorActivity || {}

  if (!indicatorActivity) return null

  return (
    <AnimatedRightPanel
      onCloseRedirectTo={onCloseRedirectTo}
      title="Modificar indicador"
      actions={
        <div className="flex flex-col gap-4 md:flex-row">
          <SubmitButton form={formId} size="SM">
            Guardar
          </SubmitButton>

          <Form
            className="w-full"
            method="post"
            action={$path('/activity/indicators/:indicatorActivityId/delete', {
              indicatorActivityId: indicatorActivity?.id,
            })}
          >
            <SubmitButton variant={ButtonColorVariants.WARNING} size="SM">
              Eliminar
            </SubmitButton>
          </Form>
        </div>
      }
    >
      <IndicatorActivityForm
        formId={formId}
        currentUserEmail={employee.user.email}
        indicators={indicators}
        companyId={companyId}
        defaultValues={{
          value,
          date: parseISOLocalNullable(date) as Date,
          indicatorId,
          employeeId: employee.id,
        }}
      />
    </AnimatedRightPanel>
  )
}
