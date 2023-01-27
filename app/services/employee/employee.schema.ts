import { EmployeeRole, EmployeeStatus } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { zDate } from '../../schemas/helpers'
import { bankAccountSchema } from '../bank/bank.schema'

export const employeeSchema = z.object({
  salaryFiat: zfd.numeric(z.number().nullish().default(null)),
  salaryCrypto: zfd.numeric(z.number().nullish().default(null)),
  advanceMaxAmount: zfd.numeric(z.number().default(0)),
  advanceCryptoMaxAmount: zfd.numeric(z.number().default(0).nullable()),
  advanceAvailableAmount: zfd.numeric(z.number().default(0)),
  advanceCryptoAvailableAmount: zfd.numeric(z.number().default(0).nullable()),

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

  phone: zfd.text(z.string().nullable().default(null)),
  address: zfd.text(z.string().nullable().default(null)),
  numberOfChildren: zfd.numeric(z.number().int().nullish().default(0)),

  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.INACTIVE),
  roles: z.array(zfd.text(z.nativeEnum(EmployeeRole))).nullish(),

  countryId: zfd.numeric(z.number().int().nullish()),
  stateId: zfd.numeric(z.number().int().nullish()),
  cityId: zfd.numeric(z.number().int().nullish()),
  genderId: zfd.numeric(z.number().int().nullish()),

  membershipId: zfd.numeric(
    z
      .number({
        required_error: 'Por favor, selecciona una membresía',
        invalid_type_error: 'Por favor, selecciona una membresía',
      })
      .int()
  ),
  currencyId: zfd.numeric(z.number().int().nullish()),
  cryptocurrencyId: zfd.numeric(z.number().int().nullish()),
  jobDepartmentId: zfd.numeric(z.number().int().nullish()),
  jobPositionId: zfd.numeric(z.number().int().nullish()),

  documentIssueDate: zDate(
    z
      .date({
        invalid_type_error: 'Ingrese la fecha de expedición',
        required_error: 'Ingrese la fecha de expedición',
      })
      .nullish()
  )
    .nullable()
    .default(null),

  birthDay: zDate(
    z
      .date({
        invalid_type_error: 'Ingrese la fecha de nacimiento',
        required_error: 'Ingrese la fecha de nacimiento',
      })
      .nullish()
  )
    .nullable()
    .default(null),

  wallet: z
    .object({
      address: zfd.text(z.string().nullish()),
      cryptoNetworkId: zfd.numeric(z.number().int().nullish()),
    })
    .nullish(),

  bankAccount: bankAccountSchema,

  inactivatedAt: zDate(
    z
      .date({
        invalid_type_error: 'Ingrese la fecha de retiro',
        required_error: 'Ingrese la fecha de retiro',
      })
      .nullish()
  )
    .nullable()
    .default(null),

  startedAt: zDate(
    z
      .date({
        invalid_type_error: 'Ingrese la fecha de ingreso',
        required_error: 'Ingrese la fecha de ingreso',
      })
      .nullish()
  )
    .nullable()
    .default(null),
})

export const employeeValidator = withZod(employeeSchema)
export type EmployeeSchemaInput = z.infer<typeof employeeSchema>
