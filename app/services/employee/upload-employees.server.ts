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

interface UploadEmployeesArgs {
  data: ClientUploadEmployeeSchemaInput[]
  companyId: Company['id']
  canManageFinancialInformation?: boolean
}

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

  const errorResponses: Record<string, string[]> = {}
  let createdUsersCount = 0
  let updatedUsersCount = 0
  const usersWithErrors: Array<ClientUploadEmployeeSchemaInput> = []

  const promises = data.map(async (item, itemIndex) => {
    const parsed = clientUploadEmployeesSchema.safeParse(item)

    errorResponses[itemIndex] = []

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        errorResponses[itemIndex].push(issue.message)
      )

      return usersWithErrors.push({
        ...item,
        ERRORES: errorResponses[itemIndex].join('\n'),
      })
    } else {
      const {
        CORREO_ELECTRONICO: email,
        NOMBRE: firstName,
        APELLIDO: lastName,
        ESTADO: status,

        CARGO: jobPositionName,
        DEPARTAMENTO: jobDepartmentName,
        CELULAR: phone,
        PAIS: countryName,

        BANCO: bankName,
        TIPO_DE_CUENTA: accountTypeName,
        NUMERO_DE_CUENTA: accountNumber,
        TIPO_DE_DOCUMENTO: documentTypeName,
        DOCUMENTO_DE_IDENTIDAD: documentNumber,

        SALARIO: salary,

        FECHA_DE_INGRESO: startedAt,
        FECHA_DE_RETIRO: inactivatedAt,

        PUNTOS_DISPONIBLES: availablePoints,
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
        const country = countryName
          ? await prisma.country.findFirst({
              where: {
                name: {
                  contains: countryName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (countryName && !country) {
          errorResponses[itemIndex].push(`País ${countryName} no encontrado`)
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

        const jobDepartment = jobDepartmentName
          ? await prisma.jobDepartment.findFirst({
              where: {
                name: {
                  contains: jobDepartmentName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (jobDepartmentName && !jobDepartment) {
          errorResponses[itemIndex].push(
            `Departamento de trabajo "${jobDepartmentName}" no encontrado`
          )
        }

        const jobPosition = jobPositionName
          ? await prisma.jobPosition.findFirst({
              where: {
                name: {
                  contains: jobPositionName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (jobPositionName && !jobPosition) {
          errorResponses[itemIndex].push(
            `Cargo "${jobPositionName}" no encontrado`
          )
        }

        const bank = bankName
          ? await prisma.bank.findFirst({
              where: {
                name: {
                  contains: bankName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (bankName && !bank) {
          errorResponses[itemIndex].push(`Banco "${bankName}" no encontrado`)
        }

        const accountType = accountTypeName
          ? await prisma.bankAccountType.findFirst({
              where: {
                name: {
                  contains: accountTypeName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (accountTypeName && !accountType) {
          errorResponses[itemIndex].push(
            `Tipo de cuenta "${accountTypeName}" no encontrada`
          )
        }

        const documentType = documentTypeName
          ? await prisma.identityDocumentType.findFirst({
              where: {
                name: {
                  contains: documentTypeName,
                  mode: 'insensitive',
                },
              },
            })
          : null

        if (documentTypeName && !documentType) {
          errorResponses[itemIndex].push(
            `Tipo de documento "${documentTypeName}" no encontrado`
          )
        }

        const bankAccountFields = [
          bank,
          accountType,
          accountNumber,
          documentType,
          documentNumber,
        ]
        const bankAccountHasOneValue = bankAccountFields.some(Boolean)
        const bankAccountHasAllValues = bankAccountFields.every(Boolean)

        if (bankAccountHasOneValue !== bankAccountHasAllValues) {
          errorResponses[itemIndex].push(
            'La información de la cuenta bancaria se encuentra incompleta'
          )
        }

        if (bankAccountHasOneValue && !canManageFinancialInformation) {
          errorResponses[itemIndex].push(
            'Usuario no autorizado para actualizar información financiera'
          )
        }

        const createBankAccount: Prisma.BankAccountCreateInput | undefined =
          bankAccountHasAllValues
            ? {
                accountNumber: accountNumber as string,
                bank: connect(bank?.id as number),

                accountType: connect(accountType?.id as number),

                identityDocument: {
                  create: {
                    value: documentNumber as string,
                    documentType: connect(documentType?.id as number),
                  },
                },
              }
            : undefined

        const updateBankAccount: Prisma.BankAccountUpdateInput | undefined =
          bankAccountHasAllValues
            ? {
                accountNumber: accountNumber as string,
                bank: connect(bank?.id),

                accountType: connect(accountType?.id),

                identityDocument: {
                  upsert: {
                    create: {
                      value: documentNumber as string,
                      documentType: connect(documentType?.id as number),
                    },
                    update: {
                      value: documentNumber as string,
                      documentType: connect(documentType?.id as number),
                    },
                  },
                },
              }
            : undefined

        if (errorResponses[itemIndex].length > 0) {
          return usersWithErrors.push({
            ...item,
            ERRORES: errorResponses[itemIndex].join('\n'),
          })
        }

        const newUser = await generateCreateUserInput({
          firstName,
          lastName,
          email,
        })

        const employee = await prisma.employee.upsert({
          where: {
            id: existingUser?.employee?.id || '',
          },
          include: {
            user: true,
          },
          create: {
            user: {
              create: {
                ...newUser,
              },
            },
            availablePoints: availablePoints
              ? parseFloat(availablePoints)
              : undefined,

            startedAt: startedAt
              ? sanitizeDate(new Date(startedAt))
              : undefined,

            inactivatedAt: inactivatedAt
              ? sanitizeDate(new Date(inactivatedAt))
              : undefined,

            salaryFiat: parseFloat(salary),

            roles: [EmployeeRole.MEMBER],
            phone,

            status:
              status?.toLowerCase() == EmployeeStatus.ACTIVE.toLowerCase() ||
              status?.toLowerCase() == 'activo'
                ? EmployeeStatus.ACTIVE
                : EmployeeStatus.INACTIVE,

            company: connect(company?.id),

            jobDepartment: connect(jobDepartment?.id),
            jobPosition: connect(jobPosition?.id),

            country: connect(country?.id),
            currency: connectCurrencyDefault,
            bankAccount: { create: createBankAccount },
          },
          update: {
            user: {
              update: {
                ...newUser,
              },
            },
            availablePoints: availablePoints
              ? parseFloat(availablePoints)
              : undefined,

            startedAt: startedAt
              ? sanitizeDate(new Date(startedAt))
              : undefined,

            salaryFiat: parseFloat(salary),

            roles: [EmployeeRole.MEMBER],
            phone,

            /** If we have an "inactivatedAt" value,
             *  we will use it.
             *  If not, we will check the status update
             *  and check if we should update the field or
             *  delete the current value.
             */
            inactivatedAt: inactivatedAt
              ? sanitizeDate(new Date(inactivatedAt))
              : existingUser?.employee?.status === EmployeeStatus.ACTIVE &&
                status?.toLowerCase() == 'inactivo'
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

            country: connect(country?.id),
            currency: connectCurrencyDefault,

            bankAccount: createBankAccount &&
              updateBankAccount && {
                upsert: {
                  create: createBankAccount,
                  update: updateBankAccount,
                },
              },
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

        return employee
      } catch (e) {
        // todo: Add Logger
        console.error(e)
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          errorResponses[itemIndex].push(`El correo ya está en uso`)
        } else if (e instanceof Error) {
          errorResponses[itemIndex].push(
            `Error inesperado, favor contactar al equipo de desarrollo: ${e?.message}`
          )
        }

        return usersWithErrors.push({
          ...item,
          ERRORES: errorResponses[itemIndex].join('\n'),
        })
      }
    }
  })

  await Promise.all(promises)

  return { createdUsersCount, updatedUsersCount, usersWithErrors }
}
