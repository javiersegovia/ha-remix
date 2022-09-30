import { PayrollAdvancePaymentMethod } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const calculatePayrollSchema = z.object({
  requestedAmount: zfd.numeric(
    z.number({
      required_error: 'Ingrese el monto a solicitar',
    })
  ),

  paymentMethod: z.nativeEnum(PayrollAdvancePaymentMethod, {
    // Here we use errorMap because it seems like required_error and
    // invalid_type are not working properly with enums
    errorMap: () => ({
      message: 'Seleccione un método de pago',
    }),
  }),

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

export const calculatePayrollValidator = withZod(calculatePayrollSchema)
export type CalculatePayrollSchemaInput = z.infer<typeof calculatePayrollSchema>
