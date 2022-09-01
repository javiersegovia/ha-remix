import * as z from 'zod'

export const GlobalSettingsModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  daysWithoutRequestsBeforePaymentDay: z.number().int(),
  annualInterestRate: z.number(),
})
