import { EmployeeStatus } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { ISO_DATE_REGEX } from '~/utils/formatDate'

export const uploadEmployeeSchema = z.object({
  CORREO_ELECTRONICO: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un correo electrónico',
      required_error: 'Ingrese un correo electrónico',
    })
  ),
  NOMBRE: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un nombre',
      required_error: 'Ingrese un nombre',
    })
  ),
  APELLIDO: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un apellido',
      required_error: 'Ingrese un apellido',
    })
  ),
  MEMBRESIA: zfd.text(z.string().nullish()),
  ESTADO: zfd.text(z.string().nullable().default(EmployeeStatus.INACTIVE)),

  CARGO: zfd.text(z.string().nullish()),
  DEPARTAMENTO: zfd.text(z.string().nullish()),

  PAIS: zfd.text(z.string().nullish()),

  BANCO: zfd.text(z.string().nullish()),
  TIPO_DE_CUENTA: zfd.text(z.string().nullish()),
  NUMERO_DE_CUENTA: zfd.text(z.string().nullish()),
  TIPO_DE_DOCUMENTO: zfd.text(z.string().nullish()),
  DOCUMENTO_DE_IDENTIDAD: zfd.text(z.string().nullish()),

  SALARIO: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un salario',
      required_error: 'Ingrese un salario',
    })
  ),
  CUPO_APROBADO: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un cupo aprobado',
      required_error: 'Ingrese un cupo aprobado',
    })
  ),
  CUPO_DISPONIBLE: zfd.text(
    z.string({
      invalid_type_error: 'Ingrese un cupo disponible',
      required_error: 'Ingrese un cupo disponible',
    })
  ),
  FECHA_DE_INGRESO: zfd.text(
    z
      .string()
      .regex(
        ISO_DATE_REGEX,
        'El formato de fecha es inválido. Debe ser año-mes-día, por ejemplo: 2023-12-25'
      )
      .nullish()
  ),
  FECHA_DE_RETIRO: zfd.text(
    z
      .string()
      .regex(
        ISO_DATE_REGEX,
        'El formato de fecha es inválido. Debe ser año-mes-día, por ejemplo: 2023-12-25'
      )
      .nullish()
  ),
  CELULAR: zfd.text(z.string().nullish()),
})

export const uploadEmployeeValidator = withZod(uploadEmployeeSchema)
export type UploadEmployeeSchemaInput = z.infer<typeof uploadEmployeeSchema>
