import * as z from 'zod'

export const AdminUserModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string(),
  password: z.string(),
})
