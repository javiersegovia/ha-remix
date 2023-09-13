import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

// export type TUploadEmployeeErrorReport = Array<{
//   email?: string
//   errors?: string
// }>

export const uploadEmployeeErrorReportSchema = z.array(
  z.object({
    email: zfd.text(z.string().trim()),
    errors: zfd.text(z.string().trim()),
  })
)

export const uploadEmployeeErrorReportValidator = withZod(
  uploadEmployeeErrorReportSchema
)
export type UploadEmployeeErrorReportSchemaInput = z.infer<
  typeof uploadEmployeeErrorReportSchema
>
