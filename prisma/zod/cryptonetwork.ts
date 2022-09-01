import * as z from 'zod'

export const CryptoNetworkModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  networkIdNumber: z.number().int(),
})
