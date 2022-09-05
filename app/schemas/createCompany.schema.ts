import z from 'zod'
import { CompanyStatus } from '@prisma/client'
import { formatPaymentDays, valueAsNumber } from './helpers'

export const createCompanySchema = z.object({
  name: z
    .string({
      required_error: 'Ingrese el nombre de la compañía',
    })
    .min(4, 'El nombre debe poseer al menos 4 caracteres'),

  status: z
    .object({ value: z.nativeEnum(CompanyStatus) })
    .default({ value: CompanyStatus.INACTIVE }),

  description: z.string().nullish(),
  address: z.string().nullish(),
  phone: z.string().nullish(),

  dispersion: z.preprocess(valueAsNumber, z.number().int().nullish()),

  // Todo: Add "preprocess" for parsing the value before asserting that it is an array of numbers
  paymentDays: z.preprocess(formatPaymentDays, z.number().array().nullish()),

  lastRequestDay: z.preprocess(valueAsNumber, z.number().int().nullish()),

  premiumDispersion: z.preprocess(valueAsNumber, z.number().int().nullish()),

  // Todo: Add "preprocess" for parsing the value before asserting that it is an array of numbers
  premiumPaymentDays: z.preprocess(
    formatPaymentDays,
    z.number().array().nullish()
  ),

  premiumLastRequestDay: z.preprocess(
    valueAsNumber,
    z.number().int().nullish()
  ),

  country: z.object({ id: z.number().int().nullish() }).nullish(),
})

export type CreateCompanySchemaInput = z.TypeOf<typeof createCompanySchema>
