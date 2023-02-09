import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const MAX_FILE_SIZE = 500000 as const
// const ACCEPTED_IMAGE_TYPES = [
//   'image/jpeg',
//   'image/jpg',
//   'image/png',
//   'image/webp',
// ] as const

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
  // .refine(
  //   (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
  //   'Por favor, utiliza uno de los siguientes formatos: .jpg, .jpeg, .png y .webp'
  // ) as ZodType<File>,

  /** This "mainImageKey" field will be equal to the recently uploaded image key
   *  It won't be present in the form, but instead will be sent to the Benefit Service functions
   *  If the first passed, and the image was created successfully on AWS.
   */
  mainImageKey: zfd.text(z.string().trim().nullish()),

  /** This "delete_mainImage" field will be added automatically by the ImageInput component */
  delete_mainImage: zfd.checkbox({ trueValue: 'true' }).nullish(),

  imageUrl: zfd.text(z.string().trim().nullish()),

  buttonText: zfd.text(z.string().trim().nullish()),
  buttonHref: zfd.text(z.string().trim().nullish()),
  slug: zfd.text(z.string().trim().nullish()),

  benefitCategoryId: zfd.numeric(z.number().nullish()),
})

export const benefitValidator = withZod(benefitSchema)
export type BenefitInputSchema = z.infer<typeof benefitSchema>
