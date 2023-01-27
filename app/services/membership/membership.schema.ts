import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const membershipSchema = z.object({
  name: zfd.text(
    z
      .string({
        required_error: 'Por favor, ingrese un nombre',
      })
      .trim()
  ),

  benefitsIds: z.array(zfd.numeric(z.number())).nullish(),
})

export const membershipValidator = withZod(membershipSchema)
export type MembershipInputSchema = z.infer<typeof membershipSchema>
