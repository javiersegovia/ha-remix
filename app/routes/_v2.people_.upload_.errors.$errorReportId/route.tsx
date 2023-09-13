import type { TableRowProps } from '~/components/Lists/Table'
import type { LoaderArgs } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { json } from '@remix-run/node'
import { $params, $path } from 'remix-routes'
import { getErrorReportById } from '~/services/error-report/error-report.server'
import { useLoaderData } from '@remix-run/react'
import { uploadEmployeeErrorReportSchema } from '~/services/error-report/error-report.schema'
import { Table } from '~/components/Lists/Table'
import { GoBack } from '~/components/Button/GoBack'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { errorReportId } = $params(
    '/people/upload/errors/:errorReportId',
    params
  )

  const errorReport = await getErrorReportById(errorReportId)

  const details =
    errorReport?.details && typeof errorReport.details === 'string'
      ? JSON.parse(errorReport.details)
      : null

  const result = uploadEmployeeErrorReportSchema.safeParse(details)

  if (result.success) {
    return json({ errorReportId: errorReport?.id, details: result.data })
  }

  return json({ errorReportId: errorReport?.id, details: null })
}

const UploadErrorDetailsRoute = () => {
  const { errorReportId, details } = useLoaderData<typeof loader>()

  if (!details) {
    return (
      <>
        <GoBack redirectTo={$path('/people/upload')} />

        <p>
          Ha ocurrido un error inesperado durante la carga masiva. Por favor
          contacta con un administrador:
        </p>
        <p className="underline">Código de error: {errorReportId}</p>
      </>
    )
  }

  const headings = ['Correo electrónico', 'Errores']

  const rows: TableRowProps[] = details?.map(({ email, errors }) => ({
    rowId: email,
    items: [email, <pre key={email}>{errors}</pre>],
  }))

  return (
    <>
      <GoBack redirectTo={$path('/people/upload')} />

      <Table headings={headings} rows={rows} />
    </>
  )
}

export default UploadErrorDetailsRoute
