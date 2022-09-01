import * as z from 'zod'

export const CurrencyModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  code: z.string(),
  countryId: z.number().int().nullish(),
})
