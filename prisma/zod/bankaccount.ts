import * as z from 'zod'

export const BankAccountModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  accountNumber: z.string(),
  accountTypeId: z.number().int(),
  bankId: z.number().int(),
  identityDocumentId: z.number().int(),
})
