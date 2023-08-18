import z from 'zod'
import { zfd } from 'zod-form-data'
import { withZod } from '@remix-validated-form/with-zod'

export const indicatorActivitySearchSchema = z.object({
  keywords: z.string().trim().optional(),
  indicatorId: zfd.numeric(z.number().int().optional()),
  teamId: zfd.numeric(z.number().int().optional()),
})

export const indicatorActivitySearchValidator = withZod(
  indicatorActivitySearchSchema
)
export type IndicatorActivitySearchParamsInput = z.infer<
  typeof indicatorActivitySearchSchema
>
