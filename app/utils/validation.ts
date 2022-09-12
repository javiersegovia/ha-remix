import type { ZodError, ZodSchema } from 'zod'

export type ActionErrors<T> = Partial<Record<keyof T, string>>

export async function validateSchema<SchemaInput>({
  request,
  schema,
}: {
  request: Request
  schema: ZodSchema
}) {
  const body = Object.fromEntries(await request.formData())

  try {
    const formData = schema.parse(body) as SchemaInput

    return { formData, errors: null }
  } catch (e) {
    const errors = e as ZodError<SchemaInput>
    return {
      formData: body as SchemaInput,
      errors: errors.issues?.reduce((acc: ActionErrors<SchemaInput>, curr) => {
        const key = curr.path[0] as keyof SchemaInput
        return { ...acc, [key]: curr.message }
      }, {}),
    }
  }
}
