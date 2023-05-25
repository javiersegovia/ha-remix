import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const run = async () => {
  const benefits = await prisma.benefit.findMany({
    where: {
      benefitHighlight: {
        isActive: true,
      },
    },
    select: {
      id: true,
    },
  })

  const { count } = await prisma.benefit.updateMany({
    where: {
      id: {
        in: benefits.map((b) => b.id),
      },
    },
    data: {
      isHighlighted: true,
    },
  })

  try {
    console.log('Running Benefit.isHighlighted update script...')
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    console.log(`Updated ${count} benefits successfully`)
    await prisma.$disconnect()
  }
}

run()
