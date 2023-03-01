import type { UploadBenefitConsumptionSchemaInput } from '~/services/benefit-consumption/benefit-consumption.schema'
import type { ActionArgs } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { badRequest } from '~/utils/responses'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { requireAdminUserId } from '~/session.server'
import { uploadBenefitConsumptions } from '~/services/benefit-consumption/benefit-consumption.server'

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/admin/dashboard/benefits',
    })
  }

  const formData = await request.formData()
  const csvFile = formData.get('csvFile')

  if (!csvFile || !(csvFile instanceof File)) {
    throw badRequest({
      message: 'No se ha encontrado el archivo CSV',
      redirect: `/admin/dashboard/benefits/${benefitId}/consumptions`,
    })
  }

  const csvFileText = await csvFile.text()

  try {
    const result = parse(csvFileText, {
      columns: true,
      skipEmptyLines: true,
      delimiter: [';', ','],
    })

    const { consumptionsWithErrors } = await uploadBenefitConsumptions(
      result,
      Number(benefitId)
    )

    if (consumptionsWithErrors.length > 0) {
      const columns: Array<
        keyof UploadBenefitConsumptionSchemaInput | 'ERRORES'
      > = [
        'CORREO',
        'CEDULA',
        'ID_SUBPRODUCTO',
        'VALOR_CONSUMIDO',
        'FECHA_DE_CONSUMO',
        'ERRORES',
      ]

      const csv = stringify(consumptionsWithErrors, {
        columns,
        header: true,
      })

      const headers = new Headers({
        'Content-disposition': `attachment; filename=${consumptionsWithErrors.length}_errores_de_consumo.csv`,
        'Content-Type': 'text/csv',
      })

      return new Response(csv, {
        headers,
        status: 200,
      })
    }

    return redirect(`/admin/dashboard/benefits/${benefitId}/consumptions`)
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error inesperado.',
      redirect: `/admin/dashboard/benefits/${benefitId}/consumptions`,
    })
  }
}
