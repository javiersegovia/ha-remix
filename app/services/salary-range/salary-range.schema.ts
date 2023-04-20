import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const formatNumberText = 'El valor debe tener un formato de numero'
const formatMinValueText = 'El valor no puede ser menor a 1.000.000 COP'

export const salaryRangeSchema = z.object({
  minValue: zfd.numeric(
    z
      .number({
        invalid_type_error: formatNumberText,
        required_error: formatNumberText,
      })
      .min(1000000, { message: formatMinValueText })
  ),
  maxValue: zfd.numeric(
    z
      .number({
        invalid_type_error: formatNumberText,
      })
      .min(1000000, { message: formatMinValueText })
      .nullish()
  ),
})

export const salaryRangeValidator = withZod(salaryRangeSchema)
export type SalaryRangeInputSchema = z.infer<typeof salaryRangeSchema>
