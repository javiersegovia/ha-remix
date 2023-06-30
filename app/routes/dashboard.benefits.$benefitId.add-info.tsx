import type {
  LoaderArgs,
  ActionArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/server-runtime'
import { getEmployeeEnabledBenefits } from '~/services/permissions/permissions.server'
import { getBenefitById } from '~/services/benefit/benefit.server'
import {
  SUCCESS_FLASH_KEY,
  getSession,
  requireEmployee,
  requireUserId,
  sessionStorage,
} from '~/session.server'
import { badRequest } from '~/utils/responses'

import { Modal } from '~/components/Dialog/Modal'
import { CenterPanel } from '~/components/Layout/CenterPanel'
import { useLoaderData } from '@remix-run/react'
import { DataItemForm } from '~/components/Forms/DataItemForm'
import { benefitDataItemsValidator } from '~/services/benefit/benefit-data-items.schema'
import { validationError } from 'remix-validated-form'
import clsx from 'clsx'
import { sendBenefitResponseToNotificationEmails } from '~/services/email/email.server'
import { $path } from 'remix-routes'

export const meta: MetaFunction = () => {
  return {
    title: 'Beneficios | HoyTrabajas Beneficios',
  }
}

export type BenefitRouteData = {
  benefit: Awaited<ReturnType<typeof getBenefitById>>
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del beneficio',
      redirect: `/dashboard/benefits`,
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw badRequest({
      message: 'No pudimos encontrar el beneficio',
      redirect: `/dashboard/benefits`,
    })
  }

  const benefits = await getEmployeeEnabledBenefits(userId)
  const hasBenefit = benefits.some((b) => b.id === parseFloat(benefitId))

  if (!hasBenefit) {
    throw badRequest({
      message:
        'No estás autorizado para visualizar los detalles de este beneficio',
      redirect: `/dashboard/benefits`,
    })
  }
  const onCloseRedirectTo = `/dashboard/benefits/${benefit.id}/details` as const
  return json({
    benefit,
    onCloseRedirectTo,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del beneficio',
      redirect: `/dashboard/benefits`,
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))
  if (!benefit) {
    throw badRequest({
      message: 'No pudimos encontrar el beneficio',
    })
  }

  if (!employee) {
    throw badRequest({
      message: 'No pudimos encontrar información del colaborador',
    })
  }

  const { data, submittedData, error } =
    await benefitDataItemsValidator.validate(await request.formData())

  if (error) {
    return validationError(error, submittedData)
  }

  const session = await getSession(request)
  session.flash(
    SUCCESS_FLASH_KEY,
    'Solicitud de beneficio exitosa. Mantente atento al correo para el siguiente paso.'
  )

  await sendBenefitResponseToNotificationEmails({
    benefit,
    employee,
    notificationEmails: benefit.notificationEmails,
    responses: data.responses,
  })

  return redirect(
    $path('/dashboard/benefits/:benefitId', { benefitId: benefit.id }),
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    }
  )
}

export default function BenefitDetailsAddInfoRoute() {
  const { benefit, onCloseRedirectTo } = useLoaderData<typeof loader>()
  const { name } = benefit
  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <CenterPanel
          className={clsx(
            'md:max-w-md',
            benefit.dataItems?.length > 3 && 'md:max-w-2xl'
          )}
        >
          <h1 className="block text-center text-2xl font-bold text-steelBlue-800">
            {name}
          </h1>

          <p
            className={clsx(
              'mx-auto py-4',
              benefit.dataItems?.length <= 3 && 'max-w-xs'
            )}
          >
            Completa tus detalles para hacer la solicitud:
          </p>

          <DataItemForm buttonText="Solicitar" />
        </CenterPanel>
      </Modal>
    </>
  )
}
