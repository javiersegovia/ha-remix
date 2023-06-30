import { EmployeeStatus } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { ISO_DATE_REGEX } from '~/utils/formatDate'

export const uploadEmployeeSchema = z.object({
  CORREO_ELECTRONICO: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un correo electrónico',
        required_error: 'Ingrese un correo electrónico',
      })
      .trim()
      .email('Correo electrónico inválido')
  ),
  NOMBRE: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un nombre',
        required_error: 'Ingrese un nombre',
      })
      .trim()
  ),
  APELLIDO: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un apellido',
        required_error: 'Ingrese un apellido',
      })
      .trim()
  ),
  MEMBRESIA: zfd.text(z.string().trim().nullish()),
  ESTADO: zfd.text(
    z.string().trim().nullable().default(EmployeeStatus.INACTIVE)
  ),

  CARGO: zfd.text(z.string().trim().nullish()),
  DEPARTAMENTO: zfd.text(z.string().trim().nullish()),

  PAIS: zfd.text(z.string().trim().nullish()),

  BANCO: zfd.text(z.string().trim().nullish()),
  TIPO_DE_CUENTA: zfd.text(z.string().trim().nullish()),
  NUMERO_DE_CUENTA: zfd.text(z.string().trim().nullish()),
  TIPO_DE_DOCUMENTO: zfd.text(z.string().trim().nullish()),
  DOCUMENTO_DE_IDENTIDAD: zfd.text(z.string().trim().nullish()),

  SALARIO: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un salario',
        required_error: 'Ingrese un salario',
      })
      .trim()
  ),
  CUPO_APROBADO: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un cupo aprobado',
        required_error: 'Ingrese un cupo aprobado',
      })
      .trim()
  ),
  CUPO_DISPONIBLE: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un cupo disponible',
        required_error: 'Ingrese un cupo disponible',
      })
      .trim()
  ),
  FECHA_DE_INGRESO: zfd.text(
    z
      .string()
      .regex(
        ISO_DATE_REGEX,
        'El formato de fecha es inválido. Debe ser año-mes-día, por ejemplo: 2023-12-25'
      )
      .trim()
      .nullish()
  ),
  FECHA_DE_RETIRO: zfd.text(
    z
      .string()
      .regex(
        ISO_DATE_REGEX,
        'El formato de fecha es inválido. Debe ser año-mes-día, por ejemplo: 2023-12-25'
      )
      .trim()
      .nullish()
  ),
  ERRORES: zfd.text(
    z
      .string({
        invalid_type_error: 'Ingrese un cupo disponible',
        required_error: 'Ingrese un cupo disponible',
      })
      .trim()
      .optional()
  ),
  CELULAR: zfd.text(z.string().trim().nullish()),
  PUNTOS_DISPONIBLES: zfd.text(z.string().trim().nullish()),
})

export const clientUploadEmployeesSchema = uploadEmployeeSchema.omit({
  MEMBRESIA: true,
  CUPO_APROBADO: true,
  CUPO_DISPONIBLE: true,
})

export const uploadEmployeeValidator = withZod(uploadEmployeeSchema)
export type UploadEmployeeSchemaInput = z.infer<typeof uploadEmployeeSchema>

export type ClientUploadEmployeeSchemaInput = z.infer<
  typeof clientUploadEmployeesSchema
>
