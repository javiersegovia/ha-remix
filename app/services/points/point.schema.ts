import { PointTransactionType } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const pointTransactionSchema = z
  .object({
    value: zfd.numeric(
      z
        .number({
          required_error: 'El valor de los puntos es requerido',
          invalid_type_error: 'El valor de los puntos debe un número entero',
        })
        .nonnegative({
          message: 'El valor de los puntos no puede ser negativo',
        })
    ),

    type: z.nativeEnum(PointTransactionType, {
      // Here we use errorMap because it seems like required_error and
      // invalid_type are not working properly with enums
      errorMap: () => ({
        message: 'El tipo de transacción es obligatorio',
      }),
    }),

    senderId: zfd.text(
      z
        .string({ invalid_type_error: 'El ID debe ser un valor de tipo texto' })
        .nullish()
    ),
    receiverId: zfd.text(
      z
        .string({ invalid_type_error: 'El ID debe ser un valor de tipo texto' })
        .nullish()
    ),
  })
  .superRefine((data, ctx) => {
    if (data) {
      const { type, senderId, receiverId } = data

      if (type !== PointTransactionType.CONSUMPTION) {
        if (!receiverId) {
          ctx.addIssue({
            code: 'custom',
            path: ['receiverId'],
            message: 'El receptor es obligatorio en este tipo de transacción',
          })
        }
      } else if (!senderId) {
        ctx.addIssue({
          code: 'custom',
          path: ['senderId'],
          message: 'El emisor es obligatorio en este tipo de transacción',
        })
      }

      if (senderId && receiverId && senderId === receiverId) {
        return ctx.addIssue({
          code: 'custom',
          path: ['senderId'],
          message: 'El emisor y el receptor no pueden ser la misma persona',
        })
      }
    }
  })

export type PointTransactionSchemaInput = z.infer<typeof pointTransactionSchema>
export const pointTransactionValidator = withZod(pointTransactionSchema)
