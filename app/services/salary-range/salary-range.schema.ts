import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const salaryRangeSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe tener formato de texto',
    })
    .trim()
    .min(5, {
      message: 'Por favor, ingrese un rango salarial',
    }),
})

export const salaryRangeValidator = withZod(salaryRangeSchema)
export type SalaryRangeInputSchema = z.infer<typeof salaryRangeSchema>
