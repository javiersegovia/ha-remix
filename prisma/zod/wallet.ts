import * as z from 'zod'

export const WalletModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  address: z.string(),
  networkId: z.number().int().nullish(),
  cryptocurrencyId: z.number().int().nullish(),
})
