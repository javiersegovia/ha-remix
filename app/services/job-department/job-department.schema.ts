import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const jobDepartmentSchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre',
    })
    .trim()
    .min(4, {
      message: 'El nombre debe poseer mínimo 4 caracteres',
    }),
})

export const jobDepartmentValidator = withZod(jobDepartmentSchema)
export type JobDepartmentInputSchema = z.infer<typeof jobDepartmentSchema>
