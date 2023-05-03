import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'
import { zfd } from 'zod-form-data'

export const employeeGroupSchema = z.object({
  name: z
    .string({
      required_error: 'Por favor, ingrese un nombre',
    })
    .trim()
    .min(3, {
      message: 'El nombre debe poseer mínimo 3 caracteres',
    }),

  benefitsIds: z.array(zfd.numeric(z.number())).nullish(),
  countryId: zfd.numeric(z.number().int().nullish()),
  stateId: zfd.numeric(z.number().int().nullish()),
  cityId: zfd.numeric(z.number().int().nullish()),
  genderId: zfd.numeric(z.number().int().nullish()),
  ageRangeId: zfd.numeric(z.number().int().nullish()),
  salaryRangeId: zfd.numeric(z.number().int().nullish()),
})

export const employeeGroupValidator = withZod(employeeGroupSchema)
export type EmployeeGroupInputSchema = z.infer<typeof employeeGroupSchema>
