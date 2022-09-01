import * as z from 'zod'

export const PayrollAdvanceBankAccountModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  accountNumber: z.string(),
  accountType: z.string(),
  currencyName: z.string().nullish(),
  bankName: z.string(),
  bankFeeName: z.string().nullish(),
  bankFeeValue: z.number().nullish(),
  bankFeeValueType: z.string().nullish(),
  identityDocumentValue: z.string(),
  identityDocumentType: z.string(),
  payrollAdvanceId: z.number().int(),
})
