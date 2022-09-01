import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __db: PrismaClient | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  prisma = global.__db
}

// export async function truncateDB() {
//     if (process.env.NODE_ENV === 'production') {
//     throw new Error(
//       "You are calling db.$reset() in a production environment. We think you probably didn't mean to do that, so we are throwing this error instead of destroying your life's work."
//     )
//   }

//   const tables = Prisma.dmmf.datamodel.models
//     .map((model) => model.dbName)
//     .filter((table) => table);

//   await prisma.$transaction([
//     ...tables.map((table) =>
//       prisma.$executeRawUnsafe(`TRUNCATE ${table} CASCADE;`)
//     ),
//   ])
// }

// export async function truncateDB() {
//   const tablenames = await prisma.$queryRaw<
//     Array<{ tablename: string }>
//   >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

//   for (const { tablename } of tablenames) {
//     if (tablename !== "_prisma_migrations") {
//       try {
//         await prisma.$executeRawUnsafe(
//           `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
//         );
//       } catch (error) {
//         console.log({ error });
//       }
//     }
//   }
// }

export { prisma }
