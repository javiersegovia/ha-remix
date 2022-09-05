import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Ingrese un correo electrónico',
    })
    .email('Correo electrónico inválido'),
  password: z
    .string({
      required_error: 'Ingrese una contraseña',
    })
    .min(6, 'La contraseña debe poseer al menos 6 caracteres'),
  redirectTo: z.string().default('/dashboard'),
})

export const loginEmailSchema = loginSchema.pick({ email: true })

export type LoginSchemaInput = z.TypeOf<typeof loginSchema>
export type LoginEmailSchemaInput = z.TypeOf<typeof loginEmailSchema>
