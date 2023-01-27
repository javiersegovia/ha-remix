import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const benefitSubproductSchema = z.object({
  name: zfd.text(
    z
      .string({
        required_error: 'Por favor, ingrese un nombre',
      })
      .trim()
  ),

  discount: zfd.numeric(z.number().nullish()),
})

export const benefitSubproductValidator = withZod(benefitSubproductSchema)
export type BenefitSubproductInputSchema = z.infer<
  typeof benefitSubproductSchema
>
