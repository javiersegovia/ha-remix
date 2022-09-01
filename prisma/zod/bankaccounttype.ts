import * as z from 'zod'

export const BankAccountTypeModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
})
