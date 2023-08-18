import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { ISO_DATE_REGEX } from '~/utils/formatDate'

export const uploadIndicatorActivitySchema = z.object({
  CORREO_ELECTRONICO: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un correo electrónico',
        required_error: 'Ingrese un correo electrónico',
      })
      .trim()
      .email('Correo electrónico inválido')
  ),

  VALOR: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un valor',
        required_error: 'Ingrese un valor',
      })
      .trim()
  ),

  FECHA: zfd.text(
    z
      .string()
      .regex(
        ISO_DATE_REGEX,
        'El formato de fecha es inválido. Debe ser año-mes-día, por ejemplo: 2023-12-25'
      )
      .trim()
      .nullish()
  ),

  ERRORES: zfd.text(z.string().trim().optional()),
})

export const uploadIndicatorActivityValidator = withZod(
  uploadIndicatorActivitySchema
)
export type UploadIndicatorActivitySchemaInput = z.infer<
  typeof uploadIndicatorActivitySchema
>

const uploadIndicatorActivityFormSchema = z.object({
  indicatorId: zfd.numeric(
    z
      .number({
        invalid_type_error: 'Seleccione un indicador',
        required_error: 'Seleccione un indicador',
      })
      .int()
  ),
})
export const uploadIndicatorActivityFormValidator = withZod(
  uploadIndicatorActivityFormSchema
)
