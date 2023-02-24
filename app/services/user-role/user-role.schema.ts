import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const userRoleSchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre',
    })
    .trim()
    .min(3, {
      message: 'El nombre debe poseer mínimo 3 caracteres',
    }),
})

export const userRoleValidator = withZod(userRoleSchema)
export type UserRoleInputSchema = z.infer<typeof userRoleSchema>
