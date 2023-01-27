import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const benefitSchema = z.object({
  name: zfd.text(
    z
      .string({
        required_error: 'Por favor, ingrese un nombre',
      })
      .trim()
  ),

  imageUrl: zfd.text(z.string().trim().nullish()),
  buttonText: zfd.text(z.string().trim().nullish()),
  buttonHref: zfd.text(z.string().trim().nullish()),
  slug: zfd.text(z.string().trim().nullish()),
})

export const benefitValidator = withZod(benefitSchema)
export type BenefitInputSchema = z.infer<typeof benefitSchema>
