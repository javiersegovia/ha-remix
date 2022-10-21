import { prisma } from '~/db.server'

export async function truncateDB() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='advance_api'`

  const promises = tablenames.map(async ({ tablename }) => {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "advance_api"."${tablename}" CASCADE;`
        )
      } catch (error) {
        console.error(error)
      }
    }
  })

  Promise.all(promises)
}
