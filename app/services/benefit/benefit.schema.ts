import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const benefitSchema = z.object({
  name: zfd.text(
    z.string({
      required_error: 'Por favor, ingrese un nombre',
    })
  ),

  imageUrl: zfd.text(z.string().nullish()),
  buttonText: zfd.text(z.string().nullish()),
  buttonHref: zfd.text(z.string().nullish()),
  slug: zfd.text(z.string().nullish()),
})

export const benefitValidator = withZod(benefitSchema)
export type BenefitInputSchema = z.infer<typeof benefitSchema>
