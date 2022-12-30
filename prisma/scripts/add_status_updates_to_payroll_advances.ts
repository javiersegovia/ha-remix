import { PrismaClient, PayrollAdvanceStatus } from '@prisma/client'

const prisma = new PrismaClient()

const load = async () => {
  let count = 0

  try {
    console.log('Running PayrollAdvance update script...')

    const payrollAdvances = await prisma.payrollAdvance.findMany({
      select: {
        id: true,
        history: {
          select: {
            actor: true,
            adminUserId: true,
            employeeId: true,
            createdAt: true,
            toStatus: true,
          },
        },
      },
    })

    const updatePromises = payrollAdvances.map(async (p) => {
      const statuses: Record<string, Date | undefined> = {
        approvedAt: undefined,
        paidAt: undefined,
        cancelledAt: undefined,
        deniedAt: undefined,
      }

      p.history.forEach((historyItem) => {
        switch (historyItem.toStatus) {
          case PayrollAdvanceStatus.APPROVED: {
            statuses.approvedAt = historyItem.createdAt
            break
          }
          case PayrollAdvanceStatus.PAID: {
            statuses.paidAt = historyItem.createdAt
            break
          }
          case PayrollAdvanceStatus.CANCELLED: {
            statuses.cancelledAt = historyItem.createdAt
            break
          }
          case PayrollAdvanceStatus.DENIED: {
            statuses.deniedAt = historyItem.createdAt
            break
          }
          default:
            break
        }
      })

      const updated = await prisma.payrollAdvance.update({
        where: {
          id: p.id,
        },
        data: {
          ...statuses,
        },
      })
      count++
      return updated
    })

    await Promise.all(updatePromises)
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    console.log(`Updated ${count} payrollAdvances successfully`)
    await prisma.$disconnect()
  }
}

load()
