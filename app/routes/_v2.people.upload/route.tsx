import type { LoaderArgs, ActionArgs } from '@remix-run/server-runtime'

import { ErrorReportType, PermissionCode } from '@prisma/client'
import { redirect, json } from '@remix-run/node'
import { $path } from 'remix-routes'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

import { useActionData } from '@remix-run/react'

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
  requireEmployee,
  sessionStorage,
} from '~/session.server'
import { parseCSV } from '~/utils/utils.server'
import { Title } from '~/components/Typography/Title'
import { Button, ButtonColorVariants } from '~/components/Button'
import { AnimatedModal } from '~/components/Animations/AnimatedModal'
import { Card } from '~/components/Cards/Card'
import { prisma } from '~/db.server'

const onCloseRedirectTo = $path('/people')

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  return json(null)
}

export const action = async ({ request }: ActionArgs) => {
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
      $path('/people/upload/errors/:errorReportId', {
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
  const actionData = useActionData<typeof action>()

  return (
    <AnimatedModal onCloseRedirectTo={onCloseRedirectTo} overrideContainer>
      <Card
        className={twMerge(
          clsx(
            'z-10  m-auto space-y-6 px-6 py-8 text-center transition-all ease-in-out'
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
                href="/people/upload"
                external
              >
                Regresar
              </Button>
            </div>
          </div>
        ) : (
          <UploadForm onCloseRedirectTo="/people" />
        )}
      </Card>
    </AnimatedModal>
  )
}

export default DashboardManageEmployeesUploadRoute
