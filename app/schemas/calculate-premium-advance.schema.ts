import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { withZod } from '@remix-validated-form/with-zod'

const calculatePremiumAdvanceSchema = z.object({
  requestedAmount: zfd.numeric(
    z.number({
      required_error: 'Ingrese el monto a solicitar',
    })
  ),

  requestReasonId: zfd.numeric(
    z
      .number({
        required_error: 'Seleccione un motivo',
      })
      .int()
  ),

  requestReasonDescription: zfd.text(
    z.string({
      required_error: 'Describa el motivo de la solicitud',
    })
  ),
})

export const calculatePremiumAdvanceValidator = withZod(
  calculatePremiumAdvanceSchema
)

export type CalculatePremiumAdvanceSchemaInput = z.infer<
  typeof calculatePremiumAdvanceSchema
>
