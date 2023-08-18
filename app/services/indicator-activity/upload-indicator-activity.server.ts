import type { Company, Indicator } from '@prisma/client'
import {
  uploadIndicatorActivitySchema,
  type UploadIndicatorActivitySchemaInput,
} from './upload-indicator-activity.schema'

import { prisma } from '~/db.server'
import { sanitizeDate } from '~/utils/formatDate'

export const uploadIndicatorActivity = async (
  data: UploadIndicatorActivitySchemaInput[],
  indicatorId: Indicator['id'],
  companyId?: Company['id']
) => {
  const errorResponses: Record<string, string[]> = {}
  let createdRecordsCount = 0
  const itemsWithErrors: Array<UploadIndicatorActivitySchemaInput> = []

  const promises = data.map(async (item, itemIndex) => {
    const parsed = uploadIndicatorActivitySchema.safeParse(item)

    errorResponses[itemIndex] = []

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) =>
        errorResponses[itemIndex].push(issue.message)
      )

      return itemsWithErrors.push({
        ...item,
        ERRORES: errorResponses[itemIndex].join('\n'),
      })
    } else {
      const {
        CORREO_ELECTRONICO: email,
        VALOR: value,
        FECHA: date,
      } = parsed.data

      try {
        const user = await prisma.user.findFirst({
          where: {
            AND: [
              { email },
              {
                employee: companyId
                  ? {
                      companyId,
                    }
                  : undefined,
              },
            ],
          },
          select: {
            employee: {
              select: {
                id: true,
              },
            },
          },
        })

        if (!user || !user?.employee) {
          errorResponses[itemIndex].push(`Correo ${email} no encontrado`)

          return itemsWithErrors.push({
            ...item,
            ERRORES: errorResponses[itemIndex].join('\n'),
          })
        }

        const iActivity = await prisma.indicatorActivity.create({
          data: {
            value: parseFloat(value),
            date: date
              ? (sanitizeDate(new Date(date)) as Date)
              : (sanitizeDate(new Date()) as Date),
            indicatorId,
            employeeId: user.employee.id,
          },
        })

        createdRecordsCount++

        return iActivity
      } catch (e) {
        // todo: Add Logger
        console.error(e)
        if (e instanceof Error) {
          errorResponses[itemIndex].push(
            `Error inesperado, favor contactar al equipo de desarrollo: ${e?.message}`
          )
        }

        return itemsWithErrors.push({
          ...item,
          ERRORES: errorResponses[itemIndex].join('\n'),
        })
      }
    }
  })

  await Promise.all(promises)

  return { createdRecordsCount, itemsWithErrors }
}
