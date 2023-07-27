import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'

export const teamSchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre',
    })
    .trim()
    .min(3, {
      message: 'El nombre debe poseer mínimo 3 caracteres',
    }),
})

export const teamValidator = withZod(teamSchema)
export type TeamInputSchema = z.infer<typeof teamSchema>
