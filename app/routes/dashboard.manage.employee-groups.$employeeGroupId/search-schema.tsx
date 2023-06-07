import { withZod } from '@remix-validated-form/with-zod'
import z from 'zod'
import { zfd } from 'zod-form-data'

export const searchSchema = z.object({
  keywords: z.string().trim().optional(),
  jobDepartmentId: zfd.numeric(z.number().int().optional()),
  ageRangeId: zfd.numeric(z.number().int().optional()),
  salaryRangeId: zfd.numeric(z.number().int().optional()),
})

export const searchValidator = withZod(searchSchema)
export type SearchParamsInput = z.infer<typeof searchSchema>
