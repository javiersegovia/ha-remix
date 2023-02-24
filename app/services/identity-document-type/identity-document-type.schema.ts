import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const identityDocumentTypeSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe tener formato de texto',
    })
    .trim()
    .min(5, {
      message: 'Por favor, ingrese un nombre',
    }),
})

export const identityDocumentTypeValidator = withZod(identityDocumentTypeSchema)
export type IdentityDocumentTypeInputSchema = z.infer<
  typeof identityDocumentTypeSchema
>
