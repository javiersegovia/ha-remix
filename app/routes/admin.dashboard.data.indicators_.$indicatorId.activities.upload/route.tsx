import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { json } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { useActionData, useLoaderData } from '@remix-run/react'

import { useToastError } from '~/hooks/useToastError'
import { UploadIndicatorActivityForm } from './upload-form'
import { badRequest } from '~/utils/responses'

import {
  ERROR_FLASH_KEY,
  SUCCESS_FLASH_KEY,
  getSession,
  requireAdminUserId,
  sessionStorage,
} from '~/session.server'
import { parseCSV } from '~/utils/utils.server'
import { Title } from '~/components/Typography/Title'
import { Button, ButtonColorVariants } from '~/components/Button'
import { AnimatedModal } from '~/components/Animations/AnimatedModal'
import { uploadIndicatorActivity } from '~/services/indicator-activity/upload-indicator-activity.server'
import { CSVLink } from 'react-csv'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { indicatorId } = params

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

  return json({ indicatorId, onCloseRedirectTo })
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
  const csvFile = formData.get('csvFile') as File

  if (!csvFile) {
    return badRequest({
      message: 'No se ha encontrado el archivo CSV',
    })
  }

  const csvString = await csvFile.text()

  try {
    const csvData = parseCSV(csvString)

    if (csvData?.length > 500) {
      return badRequest({
        message:
          'Se ha excedido el límite de subida. Por favor, evita cargar más de 400 elementos a la vez.',
      })
    }

    const { itemsWithErrors, createdRecordsCount } =
      await uploadIndicatorActivity(csvData, Number(indicatorId))

    const session = await getSession(request)

    if (itemsWithErrors.length === 0) {
      session.flash(
        SUCCESS_FLASH_KEY,
        'La lista de colaboradores se cargó de forma satisfactoria.'
      )
    } else {
      session.flash(
        ERROR_FLASH_KEY,
        `Ha ocurrido un error durante la carga de colaboradores.`
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

    return badRequest({
      message:
        'Ha ocurrido un error inesperado, por favor verifica que el formato del archivo CSV sea correcto.',
    })
  }
}

const IndicatorActivityUploadRoute = () => {
  useToastError()

  const { indicatorId, onCloseRedirectTo } =
    useLoaderData<typeof loader>() || {}
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
              href={$path(
                '/admin/dashboard/data/indicators/:indicatorId/activities/upload',
                {
                  indicatorId,
                }
              )}
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
        <UploadIndicatorActivityForm onCloseRedirectTo={onCloseRedirectTo} />
      )}
    </AnimatedModal>
  )
}

export default IndicatorActivityUploadRoute
