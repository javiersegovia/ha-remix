import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'
import { badRequest } from '~/utils/responses'

import { requireAdminUserId } from '~/session.server'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { IndicatorForm } from '~/components/Forms/IndicatorForm'
import {
  getIndicatorById,
  updateIndicatorById,
} from '~/services/indicator/indicator.server'
import { $path } from 'remix-routes'
import { SubmitButton } from '~/components/SubmitButton'
import { ButtonColorVariants } from '~/components/Button'
import { indicatorValidator } from '~/services/indicator/indicator.schema'

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

  if (!indicator) {
    throw badRequest({
      message: 'No se encontró el indicador',
      redirect: onCloseRedirectTo,
    })
  }

  return json({ indicator })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { indicatorId } = params

  if (!indicatorId || isNaN(Number(indicatorId))) {
    throw badRequest({
      message: 'No se encontró el ID del indicador',
      redirect: onCloseRedirectTo,
    })
  }

  const formData = await request.formData()

  const { data, submittedData, error } = await indicatorValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await updateIndicatorById(data, Number(indicatorId))

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = $path('/admin/dashboard/data/indicators')

export default function IndicatorUpdateRoute() {
  const { indicator } = useLoaderData<typeof loader>() || {}
  const formId = 'UpdateIndicatorForm'

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
              '/admin/dashboard/data/indicators/:indicatorId/delete',
              { indicatorId: indicator?.id }
            )}
          >
            <SubmitButton variant={ButtonColorVariants.WARNING} size="SM">
              Eliminar
            </SubmitButton>
          </Form>
        </div>
      }
    >
      <IndicatorForm formId={formId} defaultValues={indicator} />
    </AnimatedRightPanel>
  )
}
