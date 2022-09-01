import * as z from 'zod'

export const CompanyFiatDebtModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  amount: z.number(),
  currentAmount: z.number(),
  currencyId: z.number().int(),
  companyDebtId: z.string().nullish(),
  companyId: z.string(),
})
