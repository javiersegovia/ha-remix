import * as z from 'zod'

export const PayrollAdvanceWalletModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  address: z.string(),
  cryptocurrencyName: z.string(),
  cryptocurrencyAcronym: z.string(),
  cryptoNetworkName: z.string(),
  cryptoNetworkIdNumber: z.number().int(),
  payrollAdvanceId: z.number().int(),
})
