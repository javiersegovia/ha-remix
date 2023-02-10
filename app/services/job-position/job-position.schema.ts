import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const jobPositionSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe tener formato de texto',
    })
    .trim()
    .min(5, {
      message: 'Por favor, ingrese un nombre',
    }),
})

export const jobPositionValidator = withZod(jobPositionSchema)
export type JobPositionInputSchema = z.infer<typeof jobPositionSchema>
