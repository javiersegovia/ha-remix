import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { withZod } from '@remix-validated-form/with-zod'

export const indicatorActivitySchema = z.object({
  value: zfd.numeric(
    z.number({
      required_error: 'Ingrese un valor',
    })
  ),
})

export const indicatorActivityValidator = withZod(indicatorActivitySchema)
export type IndicatorActivitySchemaInput = z.infer<
  typeof indicatorActivitySchema
>
