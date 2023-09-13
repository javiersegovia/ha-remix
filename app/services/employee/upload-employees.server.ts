import type { UploadEmployeeErrorReportSchemaInput } from '../error-report/error-report.schema'
import type { ClientUploadEmployeeSchemaInput } from '~/schemas/upload-employees.schema'
import type { Company } from '@prisma/client'

import { EmployeeRole, EmployeeStatus, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'
import { sanitizeDate } from '~/utils/formatDate'
import { connect } from '~/utils/relationships'
import { badRequest } from '~/utils/responses'
import { generateCreateUserInput } from './employee.server'
import { clientUploadEmployeesSchema } from '~/schemas/upload-employees.schema'
import { sendInvitation } from '../email/email.server'
import { bankAccountSchema } from '../bank/bank.schema'

interface UploadEmployeesArgs {
  data: ClientUploadEmployeeSchemaInput[]
  companyId: Company['id']
  canManageFinancialInformation?: boolean
}

// export type TUploadEmployeeErrorReport = Array<{
//   email?: string
//   errors?: string
// }>

export const uploadEmployees = async ({
  data,
  companyId,
  canManageFinancialInformation,
}: UploadEmployeesArgs) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
    })
  }

  let createdUsersCount = 0
  let updatedUsersCount = 0
  const errorResponses: Record<string, string[]> = {}
  const errorReports: UploadEmployeeErrorReportSchemaInput = []

  const promises = data.map(async (item, itemIndex) => {
    const parsed = clientUploadEmployeesSchema.safeParse(item)

    errorResponses[itemIndex] = []

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        errorResponses[itemIndex].push(issue.message)
      )

      errorReports.push({
        email: item.CORREO_ELECTRONICO,
        errors: errorResponses[itemIndex].join('\n'),
      })
      return
    }

    const {
      CORREO_ELECTRONICO: email,
      NOMBRE: firstName,
      APELLIDO: lastName,
      ESTADO: status,

      DIRECCION: address,
      GENERO: genderName,
      CARGO: jobPositionName,
      AREA: jobDepartmentName,
      CELULAR: phone,
      PAIS: countryName,

      BANCO: bankName,
      TIPO_DE_CUENTA: accountTypeName,
      NUMERO_DE_CUENTA: accountNumber,
      TIPO_DE_DOCUMENTO: documentTypeName,
      DOCUMENTO_DE_IDENTIDAD: documentNumber,

      SALARIO: salaryFiat,

      FECHA_DE_INGRESO: startedAt,
      FECHA_DE_RETIRO: inactivatedAt,
    } = parsed.data

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        employee: {
          select: {
            id: true,
            status: true,
            bankAccount: {
              select: {
                id: true,
                accountTypeId: true,
                bankId: true,
                identityDocumentId: true,
              },
            },
          },
        },
      },
    })

    try {
      const {
        country,
        jobDepartment,
        jobPosition,
        bank,
        accountType,
        documentType,
        gender,
        errors,
      } = await getRelationshipsData({
        countryName,
        jobDepartmentName,
        jobPositionName,
        bankName,
        accountTypeName,
        documentTypeName,
        genderName,
      })

      if (errors?.length > 0) {
        errorResponses[itemIndex].push(...errors)

        errorReports.push({
          email: item.CORREO_ELECTRONICO,
          errors: errorResponses[itemIndex].join('\n'),
        })
        return
      }

      const connectCurrencyDefault: Prisma.EmployeeCreateInput['currency'] = {
        connectOrCreate: {
          where: {
            code: 'COP',
          },
          create: {
            code: 'COP',
            name: 'Peso Colombiano',
          },
        },
      }

      const parsedBankAccount = bankAccountSchema.safeParse({
        bankId: bank?.id,
        accountNumber,
        accountTypeId: accountType?.id,
        identityDocument: {
          documentTypeId: documentType?.id,
          value: documentNumber,
        },
      })

      if (!parsedBankAccount.success) {
        errorResponses[itemIndex].push(
          `Existe un error con la información de la cuenta bancaria`
        )

        errorReports.push({
          email: item.CORREO_ELECTRONICO,
          errors: errorResponses[itemIndex].join('\n'),
        })

        return
      } else if (!documentNumber && documentType) {
        errorResponses[itemIndex].push(
          `Agregue la información del número de documento`
        )

        errorReports.push({
          email: item.CORREO_ELECTRONICO,
          errors: errorResponses[itemIndex].join('\n'),
        })
        return
      }

      const createBankAccount: Prisma.BankAccountCreateInput | undefined = {
        bank: connect(bank?.id),
        accountNumber: accountNumber,
        accountType: connect(accountType?.id),
        identityDocument:
          documentNumber && documentType
            ? {
                create: {
                  value: documentNumber,
                  documentType: connect(documentType.id),
                },
              }
            : undefined,
      }

      const updateBankAccount: Prisma.BankAccountUpdateInput | undefined = {
        ...createBankAccount,
        identityDocument:
          documentNumber && documentType
            ? {
                upsert: {
                  create: {
                    value: documentNumber,
                    documentType: connect(documentType.id),
                  },
                  update: {
                    value: documentNumber,
                    documentType: connect(documentType.id),
                  },
                },
              }
            : undefined,
      }

      const newUser = await generateCreateUserInput({
        firstName,
        lastName,
        email,
      })

      await prisma.employee.upsert({
        where: {
          id: existingUser?.employee?.id || '',
        },
        select: {
          user: true,
        },
        create: {
          user: {
            create: {
              ...newUser,
            },
          },

          startedAt: startedAt ? sanitizeDate(new Date(startedAt)) : undefined,

          inactivatedAt: inactivatedAt
            ? sanitizeDate(new Date(inactivatedAt))
            : undefined,

          salaryFiat,

          roles: [EmployeeRole.MEMBER],

          phone,

          address,

          status:
            status?.toLowerCase() == EmployeeStatus.ACTIVE.toLowerCase() ||
            status?.toLowerCase() == 'activo'
              ? EmployeeStatus.ACTIVE
              : EmployeeStatus.INACTIVE,

          company: connect(company?.id),

          jobDepartment: connect(jobDepartment?.id),

          gender: connect(gender?.id),

          jobPosition: connect(jobPosition?.id),

          country: connect(country?.id),

          currency: connectCurrencyDefault,

          bankAccount: canManageFinancialInformation
            ? { create: createBankAccount }
            : undefined,
        },
        update: {
          user: {
            update: {
              ...newUser,
            },
          },

          startedAt: startedAt ? sanitizeDate(new Date(startedAt)) : undefined,

          salaryFiat,

          roles: [EmployeeRole.MEMBER],

          phone,

          address,

          /** If we have an "inactivatedAt" value,
           *  we will use it.
           *  If not, we will check the status update
           *  and check if we should update the field or
           *  delete the current value.
           */
          inactivatedAt: inactivatedAt
            ? sanitizeDate(new Date(inactivatedAt))
            : existingUser?.employee?.status === EmployeeStatus.ACTIVE &&
              (status?.toLowerCase() == 'inactivo' ||
                status?.toLowerCase() == EmployeeStatus.INACTIVE.toLowerCase())
            ? sanitizeDate(new Date())
            : undefined,

          status: status
            ? status?.toLowerCase() == EmployeeStatus.ACTIVE.toLowerCase() ||
              status?.toLowerCase() == 'activo'
              ? EmployeeStatus.ACTIVE
              : EmployeeStatus.INACTIVE
            : undefined,

          company: connect(company.id),

          jobDepartment: connect(jobDepartment?.id),

          jobPosition: connect(jobPosition?.id),

          gender: connect(gender?.id),

          country: connect(country?.id),

          currency: connectCurrencyDefault,

          bankAccount: canManageFinancialInformation
            ? {
                upsert: {
                  create: createBankAccount,
                  update: updateBankAccount,
                },
              }
            : undefined,
        },
      })

      if (process.env.NODE_ENV === 'production' && !existingUser) {
        sendInvitation({
          firstName,
          destination: email,
          token: newUser.loginToken,
        })
      }

      if (!existingUser) {
        createdUsersCount++
      } else {
        updatedUsersCount++
      }
    } catch (e) {
      // todo: Add Logger
      console.error(e)
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        errorResponses[itemIndex].push(`El correo ya está en uso`)
      } else if (e instanceof Error) {
        errorResponses[itemIndex].push(`Error inesperado: ${e.message}`)
      }

      errorReports.push({
        email: item.CORREO_ELECTRONICO,
        errors: errorResponses[itemIndex].join('\n'),
      })
    }
  })

  await Promise.all(promises)

  return { createdUsersCount, updatedUsersCount, errorReports }
}

interface GetRelationshipsDataArgs {
  countryName?: string | null
  jobDepartmentName?: string | null
  jobPositionName?: string | null
  bankName?: string | null
  accountTypeName?: string | null
  documentTypeName?: string | null
  genderName?: string | null
}

export const getRelationshipsData = async ({
  countryName,
  jobDepartmentName,
  jobPositionName,
  bankName,
  accountTypeName,
  documentTypeName,
  genderName,
}: GetRelationshipsDataArgs) => {
  const countryPromise = countryName
    ? prisma.country.findFirst({
        where: {
          name: {
            contains: countryName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const jobDepartmentPromise = jobDepartmentName
    ? prisma.jobDepartment.findFirst({
        where: {
          name: {
            contains: jobDepartmentName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const existingJobPosition = jobPositionName
    ? await prisma.jobPosition.findFirst({
        where: {
          name: {
            equals: jobPositionName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : null

  const jobPositionPromise = jobPositionName
    ? prisma.jobPosition.upsert({
        where: {
          id: existingJobPosition?.id || 0,
        },
        create: {
          name: jobPositionName,
        },
        update: {
          name: jobPositionName,
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const bankPromise = bankName
    ? prisma.bank.findFirst({
        where: {
          name: {
            contains: bankName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const accountTypePromise = accountTypeName
    ? prisma.bankAccountType.findFirst({
        where: {
          name: {
            contains: accountTypeName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const documentTypePromise = documentTypeName
    ? prisma.identityDocumentType.findFirst({
        where: {
          name: {
            contains: documentTypeName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const genderPromise = genderName
    ? prisma.gender.findFirst({
        where: {
          name: {
            contains: genderName,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
        },
      })
    : Promise.resolve(null)

  const [
    country,
    jobDepartment,
    jobPosition,
    bank,
    accountType,
    documentType,
    gender,
  ] = await Promise.all([
    countryPromise,
    jobDepartmentPromise,
    jobPositionPromise,
    bankPromise,
    accountTypePromise,
    documentTypePromise,
    genderPromise,
  ])

  const errors = []

  if (countryName && !country) {
    errors.push(`País '${countryName}' no encontrado`)
  }
  if (jobDepartmentName && !jobDepartment) {
    errors.push(`Departamento de trabajo '${jobDepartmentName}' no encontrado`)
  }
  if (jobPositionName && !jobPosition) {
    errors.push(`Cargo '${jobPositionName}' no encontrado`)
  }
  if (bankName && !bank) {
    errors.push(`Banco '${bankName}' no encontrado`)
  }
  if (accountTypeName && !accountType) {
    errors.push(`Tipo de cuenta '${accountTypeName}' no encontrada`)
  }
  if (documentTypeName && !documentType) {
    errors.push(`Tipo de documento '${documentTypeName}' no encontrado`)
  }
  if (genderName && !gender) {
    errors.push(`Género '${gender}' no encontrado`)
  }

  return {
    country,
    jobDepartment,
    jobPosition,
    bank,
    accountType,
    documentType,
    gender,
    errors,
  }
}
