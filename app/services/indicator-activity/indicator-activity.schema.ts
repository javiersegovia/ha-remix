import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { withZod } from '@remix-validated-form/with-zod'
import { zDate } from '~/schemas/helpers'

export const indicatorActivitySchema = z.object({
  value: zfd.numeric(
    z.number({
      required_error: 'Ingrese un valor',
    })
  ),

  date: zDate(
    z.date({
      invalid_type_error: 'Ingrese una fecha',
      required_error: 'Ingrese una fecha',
    })
  ).default(new Date()),

  employeeId: zfd.text(
    z.string({
      invalid_type_error: 'Seleccione un colaborador',
      required_error: 'Seleccione un colaborador',
    })
  ),
})

export const indicatorActivityValidator = withZod(indicatorActivitySchema)
export type IndicatorActivitySchemaInput = z.infer<
  typeof indicatorActivitySchema
>
