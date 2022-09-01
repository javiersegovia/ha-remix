import * as z from 'zod'
import {
  PayrollAdvanceStatus,
  PayrollAdvanceHistoryActor,
} from '@prisma/client'

export const PayrollAdvanceHistoryModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  toStatus: z.nativeEnum(PayrollAdvanceStatus),
  actor: z.nativeEnum(PayrollAdvanceHistoryActor),
  payrollAdvanceId: z.number().int(),
  employeeId: z.string().nullish(),
  adminUserId: z.string().nullish(),
})
