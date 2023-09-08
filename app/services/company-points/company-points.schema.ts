import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const companyPointsSchema = z.object({
  estimatedBudget: zfd.numeric(
    z
      .number({
        required_error: 'El valor del presupuesto es requerido',
        invalid_type_error: 'El valor del presupuesto debe un número entero',
      })
      .nonnegative({
        message: 'El valor del presupuesto no puede ser negativo',
      })
      .default(0)
  ),

  currentBudget: zfd.numeric(
    z
      .number({
        required_error: 'El valor del presupuesto es requerido',
        invalid_type_error: 'El valor del presupuesto debe un número entero',
      })
      .nonnegative({
        message: 'El valor del presupuesto no puede ser negativo',
      })
      .default(0)
  ),

  circulatingPoints: zfd.numeric(
    z
      .number({
        required_error: 'El valor de los puntos es requerido',
        invalid_type_error: 'El valor de los puntos debe un número entero',
      })
      .nonnegative({
        message: 'El valor de los puntos no puede ser negativo',
      })
      .default(0)
  ),

  spentPoints: zfd.numeric(
    z
      .number({
        required_error: 'El valor de los puntos es requerido',
        invalid_type_error: 'El valor de los puntos debe un número entero',
      })
      .nonnegative({
        message: 'El valor de los puntos no puede ser negativo',
      })
      .default(0)
  ),
})

export type CompanyPointsSchemaInput = z.infer<typeof companyPointsSchema>
export const companyPointsValidator = withZod(companyPointsSchema)
