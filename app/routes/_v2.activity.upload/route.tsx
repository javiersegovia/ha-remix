import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { useActionData, useLoaderData } from '@remix-run/react'

import { useToastError } from '~/hooks/useToastError'
import { badRequest } from '~/utils/responses'
import { UploadIndicatorActivityForm } from './upload-form'

import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import {
  ERROR_FLASH_KEY,
  SUCCESS_FLASH_KEY,
  getSession,
  requireEmployee,
  sessionStorage,
} from '~/session.server'

import { CSVLink } from 'react-csv'
import { validationError } from 'remix-validated-form'

import { getIndicators } from '~/services/indicator/indicator.server'
import { parseCSV } from '~/utils/utils.server'
import { Title } from '~/components/Typography/Title'
import { Button, ButtonColorVariants } from '~/components/Button'
import { AnimatedModal } from '~/components/Animations/AnimatedModal'
import { uploadIndicatorActivity } from '~/services/indicator-activity/upload-indicator-activity.server'
import { uploadIndicatorActivityFormValidator } from '~/services/indicator-activity/upload-indicator-activity.schema'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_INDICATOR_ACTIVITY
  )

  const onCloseRedirectTo = $path('/activity')

  const indicators = await getIndicators()

  return json({ indicators, onCloseRedirectTo })
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_INDICATOR_ACTIVITY
  )

  const formData = await request.formData()
  const csvFile = formData.get('csvFile') as File

  const { data, submittedData, error } =
    await uploadIndicatorActivityFormValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  if (!csvFile) {
    throw badRequest({
      message: 'No se ha encontrado el archivo CSV',
      redirect: $path('/activity'),
    })
  }

  const csvString = await csvFile.text()

  try {
    const csvData = parseCSV(csvString)

    if (csvData?.length > 500) {
      throw badRequest({
        message:
          'Se ha excedido el límite de subida. Por favor, evita cargar más de 400 elementos a la vez.',
      })
    }

    const { itemsWithErrors, createdRecordsCount } =
      await uploadIndicatorActivity(
        csvData,
        data.indicatorId,
        employee.companyId
      )

    const session = await getSession(request)

    if (itemsWithErrors.length === 0) {
      session.flash(
        SUCCESS_FLASH_KEY,
        'La lista de colaboradores se cargó de forma satisfactoria.'
      )
    } else {
      session.flash(
        ERROR_FLASH_KEY,
        `Ha ocurrido un error durante la carga de actividad.`
      )
    }

    return json(
      {
        createdRecordsCount,
        itemsWithErrors,
      },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    )
  } catch (e) {
    console.error(e)

    throw badRequest({
      message:
        'Ha ocurrido un error inesperado, por favor verifica que el formato del archivo CSV sea correcto.',
      redirect: $path('/activity'),
    })
  }
}

const IndicatorActivityUploadRoute = () => {
  const { onCloseRedirectTo, indicators } = useLoaderData<typeof loader>() || {}

  const actionData = useActionData<typeof action>()
  const hasActionData = actionData && 'itemsWithErrors' in actionData

  return (
    <AnimatedModal onCloseRedirectTo={onCloseRedirectTo}>
      {hasActionData ? (
        <div className="text-left">
          <Title className="mb-4 text-center">Resultados de carga masiva</Title>

          <p className="text-red-500">
            <strong>{actionData.itemsWithErrors?.length}</strong> elementos
            contienen errores
          </p>

          <p className="text-green-500">
            <strong>{actionData.createdRecordsCount}</strong> elementos creados
            satisfactoriamente
          </p>

          <div className="mt-6 flex items-center gap-6">
            <Button
              variant={ButtonColorVariants.SECONDARY}
              href={$path('/activity/upload')}
              external
            >
              Regresar
            </Button>

            <Button>
              <CSVLink
                data={actionData.itemsWithErrors}
                filename={`${actionData.itemsWithErrors.length}_errores.csv`}
              >
                Descargar informe
              </CSVLink>
            </Button>
          </div>
        </div>
      ) : (
        <UploadIndicatorActivityForm
          indicators={indicators}
          onCloseRedirectTo={onCloseRedirectTo}
        />
      )}
    </AnimatedModal>
  )
}

export default IndicatorActivityUploadRoute

export const ErrorBoundary = () => {
  useToastError()
  return null
}
