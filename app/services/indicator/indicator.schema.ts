import { IndicatorType } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const indicatorSchema = z.object({
  name: zfd.text(
    z
      .string({
        required_error: 'Ingrese el nombre del indicador',
      })
      .trim()
      .min(4, 'El nombre debe poseer al menos 4 caracteres')
  ),

  type: z.nativeEnum(IndicatorType).default(IndicatorType.CUSTOM),
})

export const indicatorValidator = withZod(indicatorSchema)
export type IndicatorSchemaInput = z.infer<typeof indicatorSchema>
