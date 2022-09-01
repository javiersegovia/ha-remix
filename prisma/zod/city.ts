import * as z from 'zod'

export const CityModel = z.object({
  id: z.number().int(),
  name: z.string(),
  stateId: z.number().int(),
})
