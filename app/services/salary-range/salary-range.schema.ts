import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const salaryRangeSchema = z.object({
  minValue: zfd.numeric(
    z
      .number({
        invalid_type_error: 'El valor debe tener un formato de numero',
      })
      .min(1000000, { message: 'El valor no puede ser menor a 1.000.000 COP' })
  ),
  maxValue: z.number({
    invalid_type_error: 'El valor debe tener un formato de numero',
  }),
})

export const salaryRangeValidator = withZod(salaryRangeSchema)
export type SalaryRangeInputSchema = z.infer<typeof salaryRangeSchema>
