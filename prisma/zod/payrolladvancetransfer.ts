import * as z from 'zod'
import { PayrollAdvanceTransferStatus } from '@prisma/client'

export const PayrollAdvanceTransferModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  transactionHash: z.string(),
  status: z.nativeEnum(PayrollAdvanceTransferStatus),
  payrollAdvanceId: z.number().int(),
  adminUserId: z.string(),
})
