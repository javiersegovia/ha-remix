import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { $path } from 'remix-routes'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { requireAdminUserId } from '~/session.server'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'
import { SubmitButton } from '~/components/SubmitButton'
import { useToastError } from '~/hooks/useToastError'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'
import { CompanyPointsForm } from '~/components/Forms/CompanyPointsForm'
import {
  getCompanyPointMetricsByCompanyId,
  upsertCompanyPoints,
} from '~/services/company-points/company-points.server'
import { companyPointsValidator } from '~/services/company-points/company-points.schema'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Actualizar presupuestos | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }

  const companyPoints = await getCompanyPointMetricsByCompanyId(companyId)

  return json({ companyId, companyPoints })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }
  const formData = await request.formData()

  const { data, submittedData, error } = await companyPointsValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await upsertCompanyPoints(data, companyId)

  return redirect(
    $path('/admin/dashboard/companies/:companyId/points', { companyId })
  )
}

export default function CompanyPointsUpdateRoute() {
  const { companyId, companyPoints } = useLoaderData<typeof loader>() || {}

  const onCloseRedirectTo = $path(
    '/admin/dashboard/companies/:companyId/points',
    { companyId }
  )

  const formId = 'CompanyPointsUpdateForm'

  return (
    <AnimatedRightPanel
      title="Actualizar presupuesto"
      onCloseRedirectTo={onCloseRedirectTo}
      actions={
        <SubmitButton form={formId} size="SM" className="ml-auto md:w-auto">
          Actualizar presupuesto
        </SubmitButton>
      }
    >
      <CompanyPointsForm formId={formId} defaultValues={companyPoints} />
    </AnimatedRightPanel>
  )
}

export const ErrorBoundary = () => {
  useToastError()
  return null
}
