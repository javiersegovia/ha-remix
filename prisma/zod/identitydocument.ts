import * as z from 'zod'

export const IdentityDocumentModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  value: z.string(),
  documentTypeId: z.number().int(),
})
