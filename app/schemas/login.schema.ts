import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Ingrese un correo electrónico',
    })
    .trim()
    .email('Correo electrónico inválido'),
  password: z
    .string({
      required_error: 'Ingrese una contraseña',
    })
    .min(6, 'La contraseña debe poseer al menos 6 caracteres'),
  redirectTo: z.string().default('/dashboard/overview'),
})

const loginEmailSchema = loginSchema.pick({ email: true })

export const loginValidator = withZod(loginSchema)
export const loginEmailValidator = withZod(loginEmailSchema)

export type LoginSchemaInput = z.TypeOf<typeof loginSchema>
export type LoginEmailSchemaInput = z.TypeOf<typeof loginEmailSchema>
