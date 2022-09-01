import * as z from 'zod'

export const PayrollAdvanceTaxModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string().nullish(),
  value: z.number(),
  payrollAdvanceId: z.number().int(),
})
