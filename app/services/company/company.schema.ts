import z from 'zod'
import { zfd } from 'zod-form-data'
import { CompanyStatus } from '@prisma/client'
import { formatPaymentDays } from '../../schemas/helpers'
import { withZod } from '@remix-validated-form/with-zod'

const companySchema = z.object({
  name: z
    .string({
      required_error: 'Ingrese el nombre de la compañía',
    })
    .min(4, 'El nombre debe poseer al menos 4 caracteres'),

  status: z.nativeEnum(CompanyStatus).default(CompanyStatus.INACTIVE),

  address: z.string().nullish(),
  description: z.string().nullish(),
  phone: z.string().nullish(),

  dispersion: zfd.numeric(z.number().nullish()),
  premiumDispersion: zfd.numeric(z.number().nullish()),

  lastRequestDay: zfd.numeric(z.number().nullish()),
  premiumLastRequestDay: zfd.numeric(z.number().nullish()),

  paymentDays: z.preprocess(formatPaymentDays, z.number().array().nullish()),
  premiumPaymentDays: z.preprocess(
    formatPaymentDays,
    z.number().array().nullish()
  ),

  countryId: zfd.numeric(z.number().nullish()),
  categoriesIds: z.array(zfd.numeric(z.number())).nullish(),

  contactPerson: z
    .object({
      firstName: z
        .string({
          required_error: 'Ingrese un nombre',
        })
        .trim()
        .nullish(),
      lastName: z
        .string({
          required_error: 'Ingrese un apellido',
        })
        .trim()
        .nullish(),
      phone: z
        .string({ required_error: 'Ingrese un número celular' })
        .trim()
        .nullish(),
    })
    .nullish(),
})

export const validator = withZod(companySchema)
export type CompanySchemaInput = z.infer<typeof companySchema>
