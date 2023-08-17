import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { requireAdminUserId } from '~/session.server'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'

import { $path } from 'remix-routes'
import { SubmitButton } from '~/components/SubmitButton'
import { IndicatorActivityForm } from '~/components/Forms/IndicatorActivityForm'
import {
  getIndicatorActivityById,
  updateIndicatorActivityById,
} from '~/services/indicator-activity/indicator-activity.server'
import { indicatorActivityValidator } from '~/services/indicator-activity/indicator-activity.schema'
import { parseISOLocalNullable } from '~/utils/formatDate'
import { ButtonColorVariants } from '~/components/Button'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { indicatorActivityId, indicatorId } = params

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

  const indicatorActivity = await getIndicatorActivityById(
    Number(indicatorActivityId)
  )

  if (!indicatorActivity) {
    throw badRequest({
      message: 'No se encontró el indicador',
      redirect: onCloseRedirectTo,
    })
  }

  return json({ indicatorId, indicatorActivity, onCloseRedirectTo })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { indicatorActivityId, indicatorId } = params

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

  const formData = await request.formData()

  const { data, submittedData, error } =
    await indicatorActivityValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await updateIndicatorActivityById(data, Number(indicatorActivityId))

  return redirect(onCloseRedirectTo)
}

export default function IndicatorUpdateRoute() {
  const { indicatorId, indicatorActivity, onCloseRedirectTo } =
    useLoaderData<typeof loader>() || {}
  const formId = 'UpdateIndicatorActivityForm' as const

  const { value, date, employee } = indicatorActivity || {}

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
            action={$path(
              '/admin/dashboard/data/indicators/:indicatorId/activities/:indicatorActivityId/delete',
              { indicatorId, indicatorActivityId: indicatorActivity?.id }
            )}
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
        defaultValues={{
          value,
          date: parseISOLocalNullable(date) as Date,
          employeeId: employee.id,
        }}
      />
    </AnimatedRightPanel>
  )
}
