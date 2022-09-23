import type { UploadEmployeeSchemaInput } from '~/schemas/upload-employees.schema'
import type { ActionFunction } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { badRequest } from 'remix-utils'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { requireAdminUserId } from '~/session.server'
import { uploadEmployees } from '~/services/employee/employee.server'

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({ message: 'No se ha encontrado el ID de la compañía' })
  }

  const formData = await request.formData()
  const csvFile = formData.get('csvFile') as File

  if (!csvFile) {
    throw badRequest({ message: 'No se ha encontrado el archivo CSV' })
  }

  const csvString = await csvFile.text()

  try {
    const result = parse(csvString, {
      columns: true,
      skipEmptyLines: true,
      delimiter: [';', ','],
    })

    const { usersWithErrors } = await uploadEmployees(result, companyId)

    const columns: Array<keyof UploadEmployeeSchemaInput | 'ERRORES'> = [
      'CORREO_ELECTRONICO',
      'NOMBRE',
      'APELLIDO',
      'ESTADO',
      'CARGO',
      'DEPARTAMENTO',
      'SALARIO',
      'CUPO_APROBADO',
      'CUPO_DISPONIBLE',
      'PAIS',
      'BANCO',
      'TIPO_DE_CUENTA',
      'NUMERO_DE_CUENTA',
      'TIPO_DE_DOCUMENTO',
      'DOCUMENTO_DE_IDENTIDAD',
      'ERRORES',
    ]

    let csv: string | null = null

    if (usersWithErrors?.length > 0) {
      csv = stringify(usersWithErrors, {
        columns,
        header: true,
      })

      const headers = new Headers({
        'Content-disposition': `attachment; filename=${usersWithErrors.length}_users_with_errors_.csv`,
        'Content-Type': 'text/csv',
      })

      return new Response(csv, {
        headers,
        status: 200,
      })
    }

    return redirect(`/admin/dashboard/companies/${companyId}/employees`)
  } catch (e) {
    console.error(e)
  }

  return null
}
