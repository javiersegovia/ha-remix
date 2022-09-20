import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const companyDebtSchema = z.object({
  fiatDebt: z
    .object({
      totalAmount: zfd.numeric(z.number()),
      currentAmount: zfd.numeric(z.number()),
    })
    .nullish(),
  cryptoDebt: z
    .object({
      totalAmount: zfd.numeric(z.number()),
      currentAmount: zfd.numeric(z.number()),
    })
    .nullish(),
})

export const companyDebtValidator = withZod(companyDebtSchema)
export type CompanyDebtSchemaInput = z.infer<typeof companyDebtSchema>
