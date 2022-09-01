import * as z from 'zod'

export const CompanyContactPersonModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  companyId: z.string(),
})
