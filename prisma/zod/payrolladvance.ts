import * as z from 'zod'
import {
  PayrollAdvanceStatus,
  PayrollAdvancePaymentMethod,
} from '@prisma/client'

export const PayrollAdvanceModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  requestedAmount: z.number(),
  totalAmount: z.number(),
  status: z.nativeEnum(PayrollAdvanceStatus),
  paymentMethod: z.nativeEnum(PayrollAdvancePaymentMethod),
  paymentTermDays: z.number().int().nullish(),
  paymentDate: z.number().int().nullish(),
  periodOfDays: z.number().int().nullish(),
  employeeId: z.string().nullish(),
  companyId: z.string(),
  companyCryptoDebtId: z.string().nullish(),
  companyFiatDebtId: z.string().nullish(),
})
