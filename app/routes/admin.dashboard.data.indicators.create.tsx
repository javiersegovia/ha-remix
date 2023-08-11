import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { requireAdminUserId } from '~/session.server'
import { validationError } from 'remix-validated-form'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { $path } from 'remix-routes'
import { indicatorValidator } from '~/services/indicator/indicator.schema'
import { createIndicator } from '~/services/indicator/indicator.server'
import { SubmitButton } from '~/components/SubmitButton'
import { IndicatorForm } from '~/components/Forms/IndicatorForm'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await indicatorValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createIndicator(data)

  return redirect(onCloseRedirectTo)
}

const onCloseRedirectTo = $path('/admin/dashboard/data/indicators')

export default function IndicatorCreateRoute() {
  const formId = 'CreateIndicatorForm'
  return (
    <AnimatedRightPanel
      title="Crear indicador"
      onCloseRedirectTo={onCloseRedirectTo}
      actions={
        <SubmitButton form={formId} size="SM" className="ml-auto md:w-auto">
          Crear
        </SubmitButton>
      }
    >
      <IndicatorForm formId={formId} />
    </AnimatedRightPanel>
  )
}
