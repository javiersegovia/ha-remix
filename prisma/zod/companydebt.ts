import * as z from 'zod'

export const CompanyDebtModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  month: z.number().int(),
  year: z.number().int(),
  companyId: z.string(),
})
