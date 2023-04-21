import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const ageRangeSchema = z
  .object({
    minAge: zfd.numeric(
      z
        .number({
          required_error: 'La edad es requerida',
          invalid_type_error: 'La edad tiene que ser un número',
        })
        .min(16, { message: 'La edad mínima es de 16 años' })
    ),
    maxAge: zfd.numeric(
      z
        .number({
          invalid_type_error: 'La edad tiene que ser un número',
        })
        .nullish()
    ),
  })
  .refine(({ minAge, maxAge }) => (maxAge ? minAge < maxAge : true), {
    message: 'La edad máxima tiene que ser mayor a la edad mínima',
    path: ['maxAge'],
  })

export const ageRangeValidator = withZod(ageRangeSchema)
export type AgeRangeInputSchema = z.infer<typeof ageRangeSchema>
