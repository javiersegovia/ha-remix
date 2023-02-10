import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { preprocessNullableObject } from '~/utils/validation'

const MAX_FILE_SIZE = 500000 as const

export const benefitSchema = z.object({
  name: zfd.text(
    z
      .string({
        required_error: 'Por favor, ingrese un nombre',
      })
      .trim()
  ),

  mainImage: z
    .any()
    .refine(
      (files) => (files?.[0] ? files?.[0]?.size <= MAX_FILE_SIZE : true),
      `El tamaño máximo es de 5MB.`
    ),

  /** This "mainImageKey" field will be equal to the existing image key when sent from the client
   *  On the server, it will be replaced by the generated AWS key.
   */
  mainImageKey: zfd.text(z.string().trim().nullish()),

  imageUrl: zfd.text(z.string().trim().nullish()),

  buttonText: zfd.text(z.string().trim().nullish()),
  buttonHref: zfd.text(z.string().trim().nullish()),
  slug: zfd.text(z.string().trim().nullish()),

  benefitCategoryId: zfd.numeric(z.number().nullish()),

  benefitHighlight: preprocessNullableObject(
    z
      .object({
        image: z
          .any()
          .refine(
            (files) => (files?.[0] ? files?.[0]?.size <= MAX_FILE_SIZE : true),
            `El tamaño máximo es de 5MB.`
          ),

        /** This "imageKey" field will be equal to the existing image key when sent from the client
         *  On the server, it will be replaced by the generated AWS key.
         */
        imageKey: zfd.text(z.string().trim().nullish()),

        title: zfd.text(
          z
            .string({
              required_error: 'Por favor, ingrese un título',
            })
            .trim()
            .min(5, 'Mínimo 5 caracteres')
        ),
        description: zfd.text(
          z
            .string({
              required_error: 'Por favor, ingrese una descripción',
            })
            .trim()
        ),
        buttonText: zfd.text(
          z
            .string({
              required_error: 'Por favor, ingrese un texto para el botón',
            })
            .trim()
        ),
        buttonHref: zfd.text(
          z
            .string({
              required_error: 'Por favor, ingrese un enlace para el botón',
            })
            .trim()
        ),

        isActive: zfd.checkbox({ trueValue: 'true' }),
      })
      .superRefine((data, ctx) => {
        if (!data.image && !data.imageKey) {
          return ctx.addIssue({
            code: 'custom',
            path: ['imageKey'],
            message: 'Por favor, seleccione una imagen',
          })
        }
      })
      .nullish()
  ),
})

export const benefitValidator = withZod(benefitSchema)
export type BenefitInputSchema = z.infer<typeof benefitSchema>
