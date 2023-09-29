import { ChallengeStatus } from '@prisma/client'
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

  goal: zfd.numeric(
    z
      .number({
        required_error: 'Ingrese una meta',
      })
      .positive()
  ),

  reward: zfd.numeric(
    z
      .number({
        required_error: 'Ingrese una recompensa',
      })
      .positive()
      .int()
  ),

  rewardEligibles: zfd.numeric(
    z
      .number({
        required_error:
          'Ingrese una cantidad de personas elegibles para la recompensa',
      })
      .positive()
      .int()
      .default(1)
  ),

  status: z.nativeEnum(ChallengeStatus).default(ChallengeStatus.INACTIVE),

  indicatorId: zfd.numeric(
    z.number({
      required_error: 'Seleccione un indicador de progreso',
    })
  ),

  teamIds: z.array(zfd.text(z.string())).nullish(),
})

export const challengeValidator = withZod(challengeSchema)
export type ChallengeSchemaInput = z.infer<typeof challengeSchema>
