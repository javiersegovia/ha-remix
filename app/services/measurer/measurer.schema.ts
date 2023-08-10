import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'

export const measurerSchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre de equipo',
    })
    .trim()
    .min(3, {
      message: 'El nombre debe poseer mínimo 3 caracteres',
    }),
  value: z.number({
    required_error:
      'Por favor, ingrese el valor con el que se hará la medición',
    invalid_type_error: 'El valor debe tener un formato de número',
  }),
})

export const measurerValidator = withZod(measurerSchema)
export type MeasurerInputSchema = z.infer<typeof measurerSchema>
