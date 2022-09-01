import * as z from 'zod'

export const GenderModel = z.object({
  id: z.number().int(),
  name: z.string(),
})
