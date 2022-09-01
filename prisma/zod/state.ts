import * as z from 'zod'

export const StateModel = z.object({
  id: z.number().int(),
  name: z.string(),
  countryId: z.number().int(),
})
