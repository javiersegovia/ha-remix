import { DataItemType } from '@prisma/client'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const dataItemSchema = z.object({
  id: z.union([
    zfd.numeric(z.number().int().nullish()),
    zfd.text(z.string().trim().nullish()),
  ]),

  label: zfd.text(
    z
      .string({
        required_error: 'Por favor, ingrese un nombre para el campo',
      })
      .trim()
  ),

  type: z
    .nativeEnum(DataItemType, {
      errorMap: () => ({
        message: 'Por favor, seleccione un tipo de dato',
      }),
    })
    .default(DataItemType.TEXT),

  benefitId: zfd.numeric(z.number().int().nullish()),
})
