import * as z from 'zod'

export const UserModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string(),
  password: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  verifiedEmail: z.boolean(),
  loginToken: z.string().nullish(),
  loginExpiration: z.date().nullish(),
})
