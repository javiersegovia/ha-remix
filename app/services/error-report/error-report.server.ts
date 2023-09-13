import type { ErrorReport } from '@prisma/client'

import { prisma } from '~/db.server'

export const getErrorReportById = async (id: ErrorReport['id']) => {
  return prisma.errorReport.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      createdAt: true,
      details: true,
      type: true,
      employee: {
        select: {
          id: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      adminUser: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  })
}
