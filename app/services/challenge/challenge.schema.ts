import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zDate } from '~/schemas/helpers'

export const challengeSchema = z.object({
  title: z
    .string({
      required_error: 'Ingrese el nombre del reto',
    })
    .trim()
    .min(5, 'El nombre debe poseer al menos 5 caracteres'),

  description: z
    .string()
    .trim()
    .min(5, 'La descripción debe poseer al menos 5 caracteres')
    .nullish(),

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

  goalDescription: z
    .string({
      required_error: 'Ingrese una meta',
    })
    .trim()
    .nullish(),

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

export const validator = withZod(challengeSchema)
export type ChallengeSchemaInput = z.infer<typeof challengeSchema>
