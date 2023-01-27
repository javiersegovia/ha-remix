import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { bankAccountSchema } from '~/services/bank/bank.schema'
import { zDate } from './helpers'

export const welcomeSchema = z.object({
  password: z
    .string({
      required_error: 'Ingrese una contraseña',
    })
    .trim()
    .min(6, {
      message: 'La contraseña debe poseer mínimo 6 caracteres',
    }),
  confirmPassword: z
    .string({
      required_error: 'Confirme su contraseña',
    })
    .trim()
    .min(6, {
      message: 'La contraseña debe poseer mínimo 6 caracteres',
    }),

  acceptedPrivacyPolicyAndTermsOfService: zfd.checkbox(),

  user: z.object({
    email: zfd.text(
      z
        .string({
          required_error: 'Ingrese un correo electrónico',
        })
        .trim()
        .email('Correo electrónico inválido')
    ),

    firstName: zfd.text(
      z
        .string({
          required_error: 'Ingrese un nombre',
        })
        .trim()
    ),

    lastName: zfd.text(
      z
        .string({
          required_error: 'Ingrese un apellido',
        })
        .trim()
    ),
  }),

  phone: zfd.text(
    z
      .string({
        required_error: 'Ingrese un número telefónico',
      })
      .trim()
  ),
  address: zfd.text(
    z
      .string({
        required_error: 'Ingrese una dirección',
      })
      .trim()
  ),
  numberOfChildren: zfd.numeric(z.number().int().default(0)),

  countryId: zfd.numeric(
    z
      .number({
        required_error: 'Seleccione un país',
      })
      .int()
  ),
  stateId: zfd.numeric(z.number().int().nullish()),
  cityId: zfd.numeric(z.number().int().nullish()),
  genderId: zfd.numeric(
    z
      .number({
        required_error: 'Seleccione un género',
      })
      .int()
  ),

  birthDay: zDate(
    z.date({
      invalid_type_error: 'Ingrese la fecha de nacimiento',
      required_error: 'Ingrese la fecha de nacimiento',
    })
  ),

  documentIssueDate: zDate(
    z.date({
      invalid_type_error: 'Ingrese la fecha de expedición de su documento',
      required_error: 'Ingrese la fecha de expedición de su documento',
    })
  ),

  bankAccount: bankAccountSchema.nullish(),
})

export const welcomeValidator = withZod(welcomeSchema)
export type WelcomeSchemaInput = z.infer<typeof welcomeSchema>
