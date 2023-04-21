import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const formatNumberText = 'El valor debe tener un formato de número'

export const salaryRangeSchema = z.object({
  minValue: zfd.numeric(
    z.number({
      required_error: 'Por favor, ingrese un valor de salario mínimo',
      invalid_type_error: formatNumberText,
    })
  ),
  maxValue: zfd.numeric(
    z
      .number({
        invalid_type_error: formatNumberText,
      })
      .nullish()
  ),
})

export const salaryRangeValidator = withZod(salaryRangeSchema)
export type SalaryRangeInputSchema = z.infer<typeof salaryRangeSchema>
