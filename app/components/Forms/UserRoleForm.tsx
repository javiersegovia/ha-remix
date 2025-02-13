import type { UserRole } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants } from '~/components/Button'
import { userRoleValidator } from '~/services/user-role/user-role.schema'
import { Box } from '../Layout/Box'
import { SubmitButton } from '../SubmitButton'

interface UserRoleFormProps {
  buttonText: string
  defaultValues?: Pick<UserRole, 'name'>
  showDeleteButton?: boolean
}

export const UserRoleForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: UserRoleFormProps) => {
  return (
    <Box className="mx-auto flex w-full flex-col space-y-5 rounded-xl p-5 md:w-auto">
      <ValidatedForm
        id="UserRoleForm"
        validator={userRoleValidator}
        method="post"
        defaultValues={defaultValues}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="name"
              type="text"
              label="Nombre"
              placeholder="Ingrese un nombre de rol de usuario"
            />
          </FormGridItem>
        </FormGridWrapper>

        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <SubmitButton className="mt-5">{buttonText}</SubmitButton>
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>

      {showDeleteButton && (
        <Form method="delete">
          <SubmitButton variant={ButtonColorVariants.WARNING}>
            Eliminar
          </SubmitButton>
        </Form>
      )}
    </Box>
  )
}
