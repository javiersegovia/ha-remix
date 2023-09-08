import type { ActionArgs } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { CSVLink } from 'react-csv'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

import { Modal } from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { useActionData } from '@remix-run/react'

import { useToastError } from '~/hooks/useToastError'
import { UploadForm } from './upload-form'
import { badRequest } from '~/utils/responses'

import { uploadEmployees } from '~/services/employee/upload-employees.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import {
  ERROR_FLASH_KEY,
  SUCCESS_FLASH_KEY,
  getSession,
  requireEmployee,
  sessionStorage,
} from '~/session.server'
import { parseCSV } from '~/utils/utils.server'
import { Title } from '~/components/Typography/Title'
import { Button, ButtonColorVariants } from '~/components/Button'

const onCloseRedirectTo = $path('/dashboard/manage/employees')

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const canManageFinancialInformation = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

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
          'Se ha excedido el límite de subida. Por favor, evita cargar más de 400 colaboradores a la vez.',
      })
    }

    const { usersWithErrors, createdUsersCount, updatedUsersCount } =
      await uploadEmployees({
        data: csvData,
        companyId: employee.companyId,
        canManageFinancialInformation,
      })

    const session = await getSession(request)

    if (usersWithErrors.length === 0) {
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
        usersWithErrors,
        createdUsersCount,
        updatedUsersCount,
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

const DashboardManageEmployeesUploadRoute = () => {
  useToastError()
  const actionData = useActionData<typeof action>()
  const hasActionData = actionData && 'usersWithErrors' in actionData

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <Box
        className={twMerge(
          clsx(
            'm-auto w-full max-w-3xl space-y-6 px-6 py-8 text-center transition-all ease-in-out'
          )
        )}
      >
        {hasActionData ? (
          <div className="text-left">
            <Title className="mb-4 text-center">
              Resultados de carga masiva
            </Title>

            <p className="text-red-500">
              <strong>{actionData.usersWithErrors?.length}</strong> usuarios
              contienen errores
            </p>

            <p className="text-green-500">
              <strong>{actionData.createdUsersCount}</strong> usuarios creados
              satisfactoriamente
            </p>

            <p className="text-green-500">
              <strong>{actionData.updatedUsersCount}</strong> usuarios
              actualizados satisfactoriamente
            </p>

            <div className="mt-6 flex flex-col items-center gap-6">
              <Button
                variant={ButtonColorVariants.SECONDARY}
                href="/dashboard/manage/employees/upload"
                external
              >
                Regresar
              </Button>

              <Button>
                <CSVLink
                  data={actionData.usersWithErrors}
                  filename={`${actionData.usersWithErrors.length}_usuarios_con_errores.csv`}
                >
                  Descargar usuarios con errores
                </CSVLink>
              </Button>
            </div>
          </div>
        ) : (
          <UploadForm onCloseRedirectTo="/dashboard/manage/employees" />
        )}
      </Box>
    </Modal>
  )
}

export default DashboardManageEmployeesUploadRoute
