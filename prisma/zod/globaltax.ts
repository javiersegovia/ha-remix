import * as z from 'zod'
import { TaxType } from '@prisma/client'

export const GlobalTaxModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string().nullish(),
  valueType: z.nativeEnum(TaxType),
  value: z.number(),
})
