import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Ingrese un correo electrónico',
    })
    .email('Correo electrónico inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe poseer al menos 6 caracteres'),
  remember: z.enum(['on']).optional(),
  redirectTo: z.string().default('/dashboard'),
})

export type LoginSchemaInput = z.TypeOf<typeof loginSchema>
