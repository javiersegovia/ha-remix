import * as z from 'zod'

export const CountryModel = z.object({
  id: z.number().int(),
  name: z.string(),
  code2: z.string(),
  phoneCode: z.string(),
})
