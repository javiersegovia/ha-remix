import * as z from 'zod'

export const BankModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  countryId: z.number().int().nullish(),
})
