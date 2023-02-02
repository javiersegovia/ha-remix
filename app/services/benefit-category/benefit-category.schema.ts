import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

export const benefitCategorySchema = z.object({
  name: z
    .string({
      invalid_type_error: 'El nombre debe tener formato de texto',
    })
    .trim()
    .min(2, {
      message: 'Por favor, ingrese un nombre',
    }),
})

export const benefitCategoryValidator = withZod(benefitCategorySchema)
export type BenefitCategoryInputSchema = z.infer<typeof benefitCategorySchema>
