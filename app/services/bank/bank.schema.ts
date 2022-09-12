import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const bankAccountSchema = z.object({
  bankId: zfd.numeric(z.number().int().nullish()),
  accountNumber: zfd.text(z.string().nullish()),
  accountTypeId: zfd.numeric(z.number().int().nullish()),
  identityDocument: z
    .object({
      documentTypeId: zfd.numeric(z.number().int().nullish()),
      value: zfd.text(z.string().nullish()),
    })
    .nullish(),
})
