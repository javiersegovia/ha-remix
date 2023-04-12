import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'

export const employeeGroupSchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre',
    })
    .trim()
    .min(3, {
      message: 'El nombre debe poseer mínimo 3 caracteres',
    }),

  benefitsIds: z.array(zfd.numeric(z.number())).nullish(),
})

export const employeeGroupValidator = withZod(employeeGroupSchema)
export type EmployeeGroupInputSchema = z.infer<typeof employeeGroupSchema>
