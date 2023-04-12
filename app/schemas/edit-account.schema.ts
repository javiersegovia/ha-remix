import type { z } from 'zod'

import { withZod } from '@remix-validated-form/with-zod'
import { welcomeSchema } from './welcome.schema'
import { employeeSchemaClient } from '~/services/employee/employee.schema'

export const editAccountSchema = welcomeSchema
  .pick({
    user: true,
    phone: true,
    address: true,
    numberOfChildren: true,
    countryId: true,
    stateId: true,
    cityId: true,
    genderId: true,
    birthDay: true,
    documentIssueDate: true,
    bankAccount: true,
  })
  .merge(
    employeeSchemaClient.pick({
      wallet: true,
    })
  )

export const editAccountValidator = withZod(editAccountSchema)
export type EditAccountSchemaInput = z.infer<typeof editAccountSchema>
