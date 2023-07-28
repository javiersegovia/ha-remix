import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { zDate } from '~/schemas/helpers'

export const challengeSchema = z.object({
  title: zfd.text(
    z
      .string({
        required_error: 'Ingrese el nombre del reto',
      })
      .trim()
      .min(5, 'El título debe poseer al menos 5 caracteres')
  ),

  description: zfd.text(z.string().trim().nullish()),

  startDate: zDate(
    z
      .date({
        invalid_type_error: 'Ingrese la fecha de inicio',
        required_error: 'Ingrese la fecha de inicio',
      })
      .nullish()
  )
    .nullable()
    .default(null),

  finishDate: zDate(
    z
      .date({
        invalid_type_error: 'Ingrese la fecha de finalización',
        required_error: 'Ingrese la fecha de finalización',
      })
      .nullish()
  )
    .nullable()
    .default(null),

  goalDescription: zfd.text(
    z
      .string({
        required_error: 'Ingrese una meta',
      })
      .trim()
  ),

  measurerDescription: z
    .string({
      required_error: 'Ingrese el nombre del medidor',
    })
    .trim()
    .min(5, 'El medidor debe poseer al menos 5 caracteres')
    .nullish(),

  rewardDescription: z
    .string({
      required_error: 'Ingrese la recompensa',
    })
    .trim()
    .nullish(),
})

export const challengeValidator = withZod(challengeSchema)
export type ChallengeSchemaInput = z.infer<typeof challengeSchema>
