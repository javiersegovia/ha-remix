import { EmployeeRole, EmployeeStatus } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { prisma } from '~/db.server'
import { preprocessNullableObject } from '~/utils/validation'
import { zDate } from '../../schemas/helpers'
import { bankAccountSchema } from '../bank/bank.schema'

export const employeeSchemaClient = z.object({
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

    password: zfd.text(z.string().trim().nullish()),

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

    roleId: zfd.text(z.string().nullable().default(null)),
  }),

  availablePoints: zfd.numeric(
    z
      .number()
      .nonnegative({
        message: 'El número debe ser positivo',
      })
      .int()
      .optional()
      .default(0)
  ),

  phone: zfd.text(z.string().nullable().default(null)),
  address: zfd.text(z.string().nullable().default(null)),
  numberOfChildren: zfd.numeric(
    z
      .number()
      .nonnegative({
        message: 'El número debe ser positivo',
      })
      .int()
      .nullish()
      .default(0)
  ),

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

// Todo: Refactor this function to be able to use it with "update" functions
export const employeeSchemaServer = employeeSchemaClient.refine(
  async (data) => {
    const exist = await prisma.user.findUnique({
      where: {
        email: data.user.email,
      },
    })

    return Boolean(!exist)
  },
  { message: 'El correo electrónico ya está en uso', path: ['user.email'] }
)

export const employeeValidatorClient = withZod(employeeSchemaClient)
export const employeeValidatorServer = withZod(employeeSchemaServer)

export type EmployeeSchemaInput = z.infer<typeof employeeSchemaClient>

export const companyDashboardEmployeeSchema = employeeSchemaClient
  .pick({
    user: true,
    phone: true,
    address: true,
    numberOfChildren: true,
    status: true,
    countryId: true,
    stateId: true,
    cityId: true,
    genderId: true,

    jobDepartmentId: true,
    jobPositionId: true,

    inactivatedAt: true,
    startedAt: true,

    documentIssueDate: true,
    birthDay: true,
  })
  .extend({
    bankAccount: preprocessNullableObject(
      z
        .object({
          bankId: zfd.numeric(z.number().int()),
          accountNumber: zfd.text(z.string().trim()),
          accountTypeId: zfd.numeric(z.number().int()),
          identityDocument: z.object({
            documentTypeId: zfd.numeric(z.number().int()),
            value: zfd.text(z.string().trim()),
          }),
        })
        .nullish()
    ),
  })

// todo update BankAccount schema references with preprocessNullableObject on employee forms

export const companyDashboardEmployeeValidatorServer = withZod(
  companyDashboardEmployeeSchema
)
export type CompanyDashboardEmployeeSchemaInput = z.infer<
  typeof companyDashboardEmployeeSchema
>

// ~~~~~~~~~~~~~~~ Employee Account Form Section ~~~~~~~~~~~~~~~~

export const employeeAccountSchema = employeeSchemaClient
  .extend({
    benefitsIds: z.array(zfd.numeric(z.number())).nullish(),
    employeeGroupsIds: z.array(zfd.text(z.string())).nullish(),
  })
  .pick({
    user: true,
    status: true,
    availablePoints: true,
    benefitsIds: true,
    employeeGroupsIds: true,
  })

export const employeeAccountValidator = withZod(employeeAccountSchema)

export type EmployeeAccountSchemaInput = z.infer<typeof employeeAccountSchema>

export const employeeAccountSchemaWithEmailVerification =
  employeeAccountSchema.refine(
    async (data) => {
      const exist = await prisma.user.findUnique({
        where: {
          email: data.user.email,
        },
      })

      return Boolean(!exist)
    },
    { message: 'El correo electrónico ya está en uso', path: ['user.email'] }
  )

export const employeeAccountSchemaWithEmailVerificationValidator = withZod(
  employeeAccountSchemaWithEmailVerification
)

// ~~~~~~~~~~~~~~~ Employee Extra Information Form Section ~~~~~~~~~~~~~~~~

export const employeeExtraInformationSchema = employeeSchemaClient.pick({
  jobDepartmentId: true,
  jobPositionId: true,
  genderId: true,
  countryId: true,
  stateId: true,
  cityId: true,

  birthDay: true,
  documentIssueDate: true,

  startedAt: true,
  inactivatedAt: true,

  address: true,
  phone: true,
  numberOfChildren: true,
})

export const employeeExtraInformationValidator = withZod(
  employeeExtraInformationSchema
)

export type EmployeeExtraInformationSchemaInput = z.infer<
  typeof employeeExtraInformationSchema
>

// ~~~~~~~~~~~~~~~ Employee Bank Account Form Section ~~~~~~~~~~~~~~~~

export const employeeBankAccountSchema = z.object({
  bankId: zfd.numeric(
    z
      .number({
        required_error: 'Por favor, seleccione un banco',
      })
      .int()
  ),
  accountNumber: zfd.text(
    z
      .string({
        required_error: 'Por favor, ingrese un número de cuenta',
      })
      .trim()
  ),
  accountTypeId: zfd.numeric(
    z
      .number({
        required_error: 'Por favor, seleccione un tipo de cuenta',
      })
      .int()
  ),
  identityDocument: z.object({
    documentTypeId: zfd.numeric(
      z
        .number({
          required_error: 'Por favor, seleccione un tipo de documento',
        })
        .int()
    ),
    value: zfd.text(
      z
        .string({
          required_error: 'Por favor, ingrese el número de documento',
        })
        .trim()
    ),
  }),
})

export const employeeBankAccountValidator = withZod(employeeBankAccountSchema)

export type EmployeeBankAccountSchemaInput = z.infer<
  typeof employeeBankAccountSchema
>
