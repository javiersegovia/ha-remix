import { z } from 'zod'

export const jobDepartmentSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe ser de formato texto',
    })
    .trim()
    .min(4, {
      message: 'Por favor, debe ingresar un nombre',
    }),
})

export type JobDepartmentInputSchema = z.infer<typeof jobDepartmentSchema>
