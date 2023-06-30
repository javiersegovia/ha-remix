import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

const responseSchema = z.object({
  label: z.string().nonempty(),
  value: z
    .union([z.number(), z.string(), z.date()])
    .refine((val) => Boolean(val), {
      message: 'Por favor, ingrese una respuesta',
    }),
})

export const benefitDataItemsSchema = z.object({
  responses: z.array(responseSchema),
})

export const benefitDataItemsValidator = withZod(benefitDataItemsSchema)
export type BenefitDataItemsSchemaInput = z.infer<typeof benefitDataItemsSchema>
