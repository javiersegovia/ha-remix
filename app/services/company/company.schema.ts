import z from 'zod'
import { zfd } from 'zod-form-data'
import { CompanyStatus } from '@prisma/client'
import { formatPaymentDays } from '../../schemas/helpers'
import { withZod } from '@remix-validated-form/with-zod'

const MAX_FILE_SIZE = 500000 as const

const companySchema = z.object({
  logoImage: z
    .any()
    .refine(
      (files) => (files?.[0] ? files?.[0]?.size <= MAX_FILE_SIZE : true),
      `El tamaño máximo es de 5MB.`
    ),
  logoImageKey: zfd.text(z.string().trim().nullish()),

  name: z
    .string({
      required_error: 'Ingrese el nombre de la compañía',
    })
    .trim()
    .min(3, 'El nombre debe poseer al menos 3 caracteres'),

  status: z.nativeEnum(CompanyStatus).default(CompanyStatus.INACTIVE),

  address: z.string().trim().nullable().default(null),
  description: z.string().trim().nullable().default(null),
  phone: z.string().trim().nullable().default(null),

  dispersion: zfd.numeric(z.number().nullable().default(null)),
  premiumDispersion: zfd.numeric(z.number().nullable().default(null)),

  lastRequestDay: zfd.numeric(z.number().nullable().default(null)),
  premiumLastRequestDay: zfd.numeric(z.number().nullable().default(null)),

  paymentDays: z.preprocess(
    formatPaymentDays,
    z.number().array().nullable().default(null)
  ),
  premiumPaymentDays: z.preprocess(
    formatPaymentDays,
    z.number().array().nullable().default(null)
  ),

  countryId: zfd.numeric(z.number().nullish()),
  categoriesIds: z.array(zfd.numeric(z.number())).nullish(),
  benefitsIds: z.array(zfd.numeric(z.number())).nullish(),

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

export const companyManagementSchema = companySchema.pick({
  logoImage: true,
  logoImageKey: true,
  name: true,
  address: true,
  description: true,
  phone: true,
  countryId: true,
  categoriesIds: true,
  benefitsIds: true,
  contactPerson: true,
})
export const companyManagementValidator = withZod(companyManagementSchema)
export type CompanyManagementSchemaInput = z.infer<
  typeof companyManagementSchema
>
