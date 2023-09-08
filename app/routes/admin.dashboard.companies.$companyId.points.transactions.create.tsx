import type { EnumOption } from '~/schemas/helpers'
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
import { PointTransactionForm } from '~/components/Forms/PointTransactionForm'
import { createPointTransaction } from '~/services/points/point.server'
import { pointTransactionValidator } from '~/services/points/point.schema'
import { validationError } from 'remix-validated-form'
import { PointTransactionType } from '@prisma/client'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear transacción de puntos | HoyTrabajas Beneficios',
  }
}

const pointTransactionTypeOptions: EnumOption[] = [
  { name: 'Recompensa', value: PointTransactionType.REWARD },
  { name: 'Consumo', value: PointTransactionType.CONSUMPTION },
  { name: 'Modificación', value: PointTransactionType.MODIFICATION },
]

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }

  return json({ companyId })
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

  const { data, submittedData, error } =
    await pointTransactionValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createPointTransaction({ ...data, companyId })

  return redirect(
    $path('/admin/dashboard/companies/:companyId/points', { companyId })
  )
}

export default function PointTransactionCreateRoute() {
  const { companyId } = useLoaderData<typeof loader>() || {}
  const onCloseRedirectTo = $path(
    '/admin/dashboard/companies/:companyId/points',
    { companyId }
  )

  const formId = 'CreatePointTransactionsForm'

  return (
    <AnimatedRightPanel
      title="Crear transacción"
      onCloseRedirectTo={onCloseRedirectTo}
      actions={
        <SubmitButton form={formId} size="SM" className="ml-auto md:w-auto">
          Crear transacción
        </SubmitButton>
      }
    >
      <PointTransactionForm
        formId={formId}
        companyId={companyId}
        pointTransactionTypeOptions={pointTransactionTypeOptions}
      />
    </AnimatedRightPanel>
  )
}

export const ErrorBoundary = () => {
  useToastError()
  return null
}
