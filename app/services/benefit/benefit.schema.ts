import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const benefitSchema = z.object({
  name: zfd.text(
    z.string({
      required_error: 'Por favor, ingrese un nombre',
    })
  ),
})

export const benefitValidator = withZod(benefitSchema)
