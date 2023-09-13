import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'

import { ErrorReportType, PermissionCode } from '@prisma/client'
import { json, redirect } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

import { Modal } from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { useActionData } from '@remix-run/react'

import { useToastError } from '~/hooks/useToastError'
import { UploadForm } from './upload-form'

import { uploadEmployees } from '~/services/employee/upload-employees.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import {
  ERROR_FLASH_KEY,
  SUCCESS_FLASH_KEY,
  getSession,
  requireAdminUserId,
  requireEmployee,
  sessionStorage,
} from '~/session.server'
import { parseCSV } from '~/utils/utils.server'
import { Title } from '~/components/Typography/Title'
import { Button, ButtonColorVariants } from '~/components/Button'
import { prisma } from '~/db.server'

const onCloseRedirectTo = $path('/dashboard/manage/employees')

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return json(null)
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)
  const session = await getSession(request)

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
    session.flash(ERROR_FLASH_KEY, 'No se ha encontrado el archivo CSV.')

    return json(null, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    })
  }

  const csvString = await csvFile.text()

  try {
    const csvData = parseCSV(csvString)

    if (csvData?.length > 400) {
      session.flash(
        ERROR_FLASH_KEY,
        'Se ha excedido el límite de subida. Por favor, evita cargar más de 400 colaboradores a la vez.'
      )

      return json(null, {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      })
    }

    const { errorReports, createdUsersCount, updatedUsersCount } =
      await uploadEmployees({
        data: csvData,
        companyId: employee.companyId,
        canManageFinancialInformation,
      })

    if (errorReports.length === 0) {
      session.flash(
        SUCCESS_FLASH_KEY,
        'La lista de colaboradores se cargó de forma satisfactoria.'
      )

      return json(
        {
          errorReports,
          createdUsersCount,
          updatedUsersCount,
        },
        {
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        }
      )
    }

    session.flash(
      ERROR_FLASH_KEY,
      `Ha ocurrido un error durante la carga de colaboradores.`
    )

    const errorReport = await prisma.errorReport.create({
      data: {
        details: JSON.stringify(errorReports),
        type: ErrorReportType.UPLOAD_EMPLOYEE,
        employeeId: employee.id,
      },
    })

    return redirect(
      $path('/dashboard/manage/employees/upload/errors/:errorReportId', {
        errorReportId: errorReport.id,
      }),
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      }
    )
  } catch (e) {
    console.error(e)

    await prisma.errorReport.create({
      data: {
        details: JSON.stringify(e),
        type: ErrorReportType.UNKNOWN,
        employeeId: employee.id,
      },
    })

    session.flash(
      ERROR_FLASH_KEY,
      'Ha ocurrido un error inesperado, por favor verifica que el formato del archivo CSV sea correcto.'
    )

    return json(null, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    })
  }
}

const DashboardManageEmployeesUploadRoute = () => {
  useToastError()
  const actionData = useActionData<typeof action>()
  // const hasActionData = actionData && 'errorReports' in actionData

  return (
    <Modal onCloseRedirectTo={onCloseRedirectTo}>
      <Box
        className={twMerge(
          clsx(
            'm-auto w-full max-w-3xl space-y-6 px-6 py-8 text-center transition-all ease-in-out'
          )
        )}
      >
        {actionData ? (
          <div className="text-left">
            <Title className="mb-4 text-center">
              Resultados de carga masiva
            </Title>

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
