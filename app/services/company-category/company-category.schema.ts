import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const companyCategorySchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre',
    })
    .trim()
    .min(3, {
      message: 'El nombre debe poseer mínimo 3 caracteres',
    }),
})

export const companyCategoryValidator = withZod(companyCategorySchema)
export type CompanyCategoryInputSchema = z.infer<typeof companyCategorySchema>
