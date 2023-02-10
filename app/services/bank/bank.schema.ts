import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const bankAccountSchema = z.object({
  bankId: zfd.numeric(z.number().int().nullish()),
  accountNumber: zfd.text(z.string().trim().nullish()),
  accountTypeId: zfd.numeric(z.number().int().nullish()),
  identityDocument: z
    .object({
      documentTypeId: zfd.numeric(z.number().int().nullish()),
      value: zfd.text(z.string().trim().nullish()),
    })
    .nullish(),
})

export const bankSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe tener formato de texto',
    })
    .trim()
    .min(5, {
      message: 'Por favor, ingrese un nombre',
    }),
})

export const bankValidator = withZod(bankSchema)
export type BankInputSchema = z.infer<typeof bankSchema>
