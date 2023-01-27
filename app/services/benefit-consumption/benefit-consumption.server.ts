import type { Benefit } from '@prisma/client'
import type { UploadBenefitConsumptionSchemaInput } from './benefit-consumption.schema'

import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { uploadBenefitConsumptionsSchema } from './benefit-consumption.schema'
import { dateAsUTC } from '~/utils/formatDate'

export const getBenefitConsumptionsByBenefitId = async (
  benefitId: Benefit['id']
) => {
  return prisma.benefitConsumption.findMany({
    where: { benefitId },
    orderBy: {
      consumedAt: 'asc',
    },
    select: {
      id: true,
      consumedAt: true,
      value: true,
      benefitSubproduct: {
        select: {
          name: true,
        },
      },
      employee: {
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

export const uploadBenefitConsumptions = async (
  data: UploadBenefitConsumptionSchemaInput[],
  benefitId: Benefit['id']
) => {
  const benefit = await prisma.benefit.findUnique({
    where: { id: benefitId },
  })

  if (!benefit) {
    throw badRequest('No se ha encontrado el ID del beneficio')
  }

  const errorResponses: Record<string, string[]> = {}
  let createdConsumptionsCount = 0

  const consumptionsWithErrors: (UploadBenefitConsumptionSchemaInput & {
    ERRORES: string
  })[] = []

  const promises = data.map(async (row, rowIndex) => {
    const parsedData = uploadBenefitConsumptionsSchema.safeParse(row)
    errorResponses[rowIndex] = []

    if (!parsedData.success) {
      parsedData.error.issues.forEach((issue) =>
        errorResponses[rowIndex].push(issue.message)
      )

      return consumptionsWithErrors.push({
        ...row,
        ERRORES: errorResponses[rowIndex].join('\n'),
      })
    }

    const {
      CORREO: email,
      CEDULA: identificationNumber,
      ID_SUBPRODUCTO: subproductId,
      VALOR_CONSUMIDO: consumedValue,
      FECHA_DE_CONSUMO: consumedAt,
    } = parsedData.data

    if (!email && !identificationNumber) {
      errorResponses[rowIndex].push(
        'Debe ingresar el correo electrónico o la cédula del empleado'
      )

      return consumptionsWithErrors.push({
        ...row,
        ERRORES: errorResponses[rowIndex].join('\n'),
      })
    }

    try {
      const benefit = benefitId
        ? await prisma.benefit.findUnique({
            where: { id: Number(benefitId) },
          })
        : null

      if (!benefit) {
        errorResponses[rowIndex].push('No se ha encontrado el ID del beneficio')

        return consumptionsWithErrors.push({
          ...row,
          ERRORES: errorResponses[rowIndex].join('\n'),
        })
      }

      const subproduct = subproductId
        ? await prisma.benefitSubproduct.findUnique({
            where: { id: Number(subproductId) },
          })
        : null

      const employeeByEmail = email
        ? await prisma.user.findUnique({
            where: { email },
            select: {
              employee: {
                select: { id: true },
              },
            },
          })
        : null

      const employeeByIdentificationNumber =
        !employeeByEmail && identificationNumber
          ? await prisma.identityDocument.findFirst({
              where: { value: identificationNumber },
              select: {
                bankAccount: {
                  select: {
                    employee: { select: { id: true } },
                  },
                },
              },
            })
          : null

      const employee =
        employeeByEmail?.employee ||
        employeeByIdentificationNumber?.bankAccount?.employee

      if (!employee) {
        errorResponses[rowIndex].push(
          'No se ha encontrado el empleado con el correo electrónico o la cédula ingresados'
        )

        return consumptionsWithErrors.push({
          ...row,
          ERRORES: errorResponses[rowIndex].join('\n'),
        })
      }

      await prisma.benefitConsumption.create({
        data: {
          benefitSubproduct: connect(subproduct?.id),
          benefit: connect(benefit.id),
          employee: connect(employee.id),
          value: Number(consumedValue),
          consumedAt: dateAsUTC(new Date(consumedAt)) as Date,
        },
      })

      createdConsumptionsCount++
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        errorResponses[rowIndex].push(
          `Error inesperado, favor contactar al equipo de desarrollo: ${e?.message}`
        )
      }

      return consumptionsWithErrors.push({
        ...row,
        ERRORES: errorResponses[rowIndex].join('\n'),
      })
    }
  })

  await Promise.all(promises)

  return { createdConsumptionsCount, consumptionsWithErrors }
}
