import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const globalSettingsSchema = z.object({
  annualInterestRate: zfd.numeric(z.number().default(0)),
  daysWithoutRequestsBeforePaymentDay: zfd.numeric(z.number().int().default(0)),
  transportationAid: zfd.numeric(z.number().int().nullable().default(null)),
})
export const globalSettingsValidator = withZod(globalSettingsSchema)

export type GlobalSettingsInputSchema = z.infer<typeof globalSettingsSchema>
