import * as z from 'zod'
import { CompanyStatus } from '@prisma/client'

export const CompanyModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  status: z.nativeEnum(CompanyStatus),
  description: z.string().nullish(),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  dispersion: z.number().nullish(),
  paymentDays: z.number().int().array(),
  lastRequestDay: z.number().int().nullish(),
  premiumDispersion: z.number().nullish(),
  premiumPaymentDays: z.number().int().array(),
  premiumLastRequestDay: z.number().int().nullish(),
  countryId: z.number().int().nullish(),
})
