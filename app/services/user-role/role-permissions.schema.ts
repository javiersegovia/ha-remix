import { PermissionCode } from '@prisma/client'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

export const userRolePermissionsSchema = z.object({
  permissions: zfd.repeatable(z.array(z.nativeEnum(PermissionCode))),
})

export const userRolePermissionsValidator = withZod(userRolePermissionsSchema)
export type UserRolePermissionsInputSchema = z.infer<
  typeof userRolePermissionsSchema
>
