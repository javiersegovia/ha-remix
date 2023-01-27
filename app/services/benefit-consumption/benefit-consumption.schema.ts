import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { ISO_DATE_REGEX } from '~/utils/formatDate'

export const uploadBenefitConsumptionsSchema = z.object({
  CORREO: zfd.text(z.string().nullish()),
  CEDULA: zfd.text(z.string().nullish()),
  ID_SUBPRODUCTO: zfd.text(z.string().nullish()),
  VALOR_CONSUMIDO: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un valor consumido',
      required_error: 'Ingrese un valor consumido',
    })
  ),
  FECHA_DE_CONSUMO: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese una fecha de consumo',
        required_error: 'Ingrese una fecha de consumo',
      })
      .regex(
        ISO_DATE_REGEX,
        'El formato de fecha es inválido. Debe ser año-mes-día, por ejemplo: 2023-12-25'
      )
  ),
})

export const uploadBenefitConsumptionsValidator = withZod(
  uploadBenefitConsumptionsSchema
)

export type UploadBenefitConsumptionSchemaInput = z.infer<
  typeof uploadBenefitConsumptionsSchema
>
