import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const benefitCategorySchema = z.object({
  name: zfd.text(
    z
      .string({
        invalid_type_error: 'El nombre debe tener formato de texto',
      })
      .trim()
      .min(2, {
        message: 'Por favor, ingrese un nombre',
      })
  ),

  hexColor: zfd.text(
    z
      .string({
        invalid_type_error: 'El color debe tener formato de texto',
      })
      .nullish()
  ),
})

export const benefitCategoryValidator = withZod(benefitCategorySchema)
export type BenefitCategoryInputSchema = z.infer<typeof benefitCategorySchema>
