import type { Company } from '@prisma/client'
import type { PointTransactionSchemaInput } from './point.schema'

import { PointTransactionType } from '@prisma/client'
import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

type CreatePointTransactionArgs = PointTransactionSchemaInput & {
  companyId: Company['id']
}

export const createPointTransaction = async (
  data: CreatePointTransactionArgs
) => {
  switch (data.type) {
    case PointTransactionType.TRANSFER:
      return handlePointTransfer(data)

    case PointTransactionType.REWARD:
      return handlePointReward(data)

    case PointTransactionType.CONSUMPTION:
      return handlePointConsumption(data)

    case PointTransactionType.MODIFICATION:
      return handlePointModification(data)

    default:
      break
  }
}

/** When a transfer occurs, we must do the following:
 *
 *  1. Add points to the "receiver" (the employee getting the points)
 *  2. Add points to the "circulatingPoints" (the total amount of points in circulation)
 *  3. Add points to the "currentBudget" (estimation of total points that were given to employees)
 */
const handlePointTransfer = async (data: CreatePointTransactionArgs) => {
  const { value, senderId, receiverId, companyId } = data

  if (!senderId) {
    throw badRequest({
      message:
        'El ID del emisor es obligatorio para una transferencia de puntos',
    })
  }

  if (!receiverId) {
    throw badRequest({
      message:
        'El ID del receptor es obligatorio para una transferencia de puntos',
    })
  }

  try {
    const updateEmployee = prisma.employee.update({
      where: {
        id: receiverId,
      },
      data: {
        availablePoints: {
          increment: value,
        },
        company: {
          update: {
            companyPoints: {
              upsert: {
                create: {
                  currentBudget: value,
                  circulatingPoints: value,
                },
                update: {
                  currentBudget: {
                    increment: value,
                  },
                  circulatingPoints: {
                    increment: value,
                  },
                },
              },
            },
          },
        },
      },
    })

    const createTransaction = prisma.pointTransaction.create({
      data: {
        type: PointTransactionType.TRANSFER,
        value,
        senderId,
        receiverId,
        companyId,
      },
    })

    await prisma.$transaction([updateEmployee, createTransaction])
  } catch (e) {
    console.error(e)
    return badRequest({
      message: 'Ocurrió un error durante la creación de la transacción',
    })
  }
}

const handlePointConsumption = async (data: CreatePointTransactionArgs) => {
  const { value, senderId, companyId } = data

  if (!senderId) {
    throw badRequest({
      message:
        'El ID del emisor es obligatorio para una transacción de consumo',
    })
  }

  try {
    // To do: Create a "Debt" model related to point redemptions

    await prisma.$transaction(async (tx) => {
      const e = await tx.employee.update({
        where: {
          id: senderId,
        },
        data: {
          availablePoints: {
            decrement: value,
          },
          company: {
            update: {
              companyPoints: {
                upsert: {
                  create: {},
                  update: {
                    circulatingPoints: {
                      decrement: value,
                    },
                    spentPoints: {
                      increment: value,
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          availablePoints: true,
          company: {
            select: {
              companyPoints: {
                select: {
                  id: true,
                  circulatingPoints: true,
                },
              },
            },
          },
        },
      })

      if (
        e.company?.companyPoints?.circulatingPoints &&
        e.company.companyPoints.circulatingPoints < 0
      ) {
        await tx.companyPoints.update({
          where: {
            id: e.company.companyPoints.id,
          },
          data: {
            circulatingPoints: 0,
          },
        })
      }

      await tx.pointTransaction.create({
        data: {
          type: PointTransactionType.CONSUMPTION,
          value,
          senderId,
          companyId,
        },
      })
    })
  } catch (e) {
    console.error(e)
    return badRequest({
      message: 'Ocurrió un error durante la creación de la transacción',
    })
  }
}

const handlePointReward = async (data: CreatePointTransactionArgs) => {
  const { value, senderId, receiverId, companyId } = data

  if (!receiverId) {
    throw badRequest({
      message:
        'El ID del receptor es obligatorio para una transacción de recompensa',
    })
  }

  try {
    const updateEmployee = prisma.employee.update({
      where: {
        id: receiverId,
      },
      data: {
        availablePoints: {
          increment: value,
        },
        company: {
          update: {
            companyPoints: {
              upsert: {
                create: {
                  circulatingPoints: value,
                  currentBudget: value,
                },
                update: {
                  currentBudget: {
                    increment: value,
                  },
                  circulatingPoints: {
                    increment: value,
                  },
                },
              },
            },
          },
        },
      },
    })

    const createTransaction = prisma.pointTransaction.create({
      data: {
        type: PointTransactionType.REWARD,
        value,
        senderId,
        receiverId,
        companyId,
      },
    })

    await prisma.$transaction([updateEmployee, createTransaction])
  } catch (e) {
    console.error(e)
    return badRequest({
      message: 'Ocurrió un error durante la creación de la transacción',
    })
  }
}

const handlePointModification = async (data: CreatePointTransactionArgs) => {
  const { value, receiverId, companyId } = data

  if (!receiverId) {
    throw badRequest({
      message:
        'El ID del receptor es obligatorio para una transacción de modificación',
    })
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: receiverId,
    },
    select: {
      availablePoints: true,
    },
  })

  if (!employee) {
    throw badRequest({
      message: 'El ID del receptor no fue encontrado',
    })
  }

  const previousAvailablePoints = employee?.availablePoints || 0
  /**
   * If (value > previousAvailablePoints), it means that the user is increasing their total amount of points.
   * Otherwise, it is decreasing it.
   */

  const isAddingPoints = value > previousAvailablePoints

  try {
    await prisma.$transaction(async (tx) => {
      const e = await tx.employee.update({
        where: {
          id: receiverId,
        },
        data: {
          availablePoints: value,
          company: {
            update: {
              companyPoints: {
                upsert: {
                  create: {
                    circulatingPoints: value || 0,
                    currentBudget: value || 0,
                  },
                  update: {
                    currentBudget: isAddingPoints
                      ? { increment: value - previousAvailablePoints }
                      : { decrement: previousAvailablePoints - value },

                    circulatingPoints: isAddingPoints
                      ? { increment: value - previousAvailablePoints }
                      : { decrement: previousAvailablePoints - value },
                  },
                },
              },
            },
          },
        },
        select: {
          company: {
            select: {
              companyPoints: {
                select: {
                  id: true,
                  circulatingPoints: true,
                  currentBudget: true,
                },
              },
            },
          },
        },
      })

      const {
        currentBudget = 0,
        circulatingPoints = 0,
        id: companyPointsId,
      } = e.company.companyPoints || {}

      await tx.companyPoints.update({
        where: {
          id: companyPointsId,
        },
        data: {
          currentBudget: currentBudget < 0 ? 0 : undefined,
          circulatingPoints: circulatingPoints < 0 ? 0 : undefined,
        },
      })

      await tx.pointTransaction.create({
        data: {
          type: PointTransactionType.MODIFICATION,
          value,
          receiverId,
          companyId,
        },
      })
    })
  } catch (e) {
    console.error(e)
    return badRequest({
      message: 'Ocurrió un error durante la creación de la transacción',
    })
  }
}
