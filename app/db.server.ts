import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __db: PrismaClient | undefined
}

// TODO: Study the possibility of adding special hooks here,
// like automatically deleting images from AWS when the related Image model is deleted

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
  // .$extends({
  //   result: {
  //     user: {
  //       fullName: {
  //         needs: { firstName: true, lastName: true },
  //         compute(user) {
  //           return `${user.firstName} ${user.lastName}`
  //         },
  //       },
  //     },
  //   },
  // })
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  prisma = global.__db
}

export { prisma }
