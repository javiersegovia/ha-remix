import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const bankAccountTypeSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe tener formato de texto',
    })
    .trim()
    .min(5, {
      message: 'Por favor, ingrese un nombre',
    }),
})

export const bankAccountTypeValidator = withZod(bankAccountTypeSchema)
export type BankAccountTypeInputSchema = z.infer<typeof bankAccountTypeSchema>
