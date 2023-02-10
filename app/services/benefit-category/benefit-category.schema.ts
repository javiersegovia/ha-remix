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
      .trim()
      .regex(/^#/, 'El color debe tener formato hexadecimal (Ej: #123456)')
      .length(7, 'El color debe tener 7 caracteres')
      .nullish()
  ),

  opacity: zfd.numeric(
    z
      .number({
        invalid_type_error: 'El nombre debe tener formato de texto',
      })
      .refine((value) => value >= 0 && value <= 1, {
        message: 'La opacidad debe estar entre 0 y 1',
      })
      .nullish()
  ),
})

export const benefitCategoryValidator = withZod(benefitCategorySchema)
export type BenefitCategoryInputSchema = z.infer<typeof benefitCategorySchema>
