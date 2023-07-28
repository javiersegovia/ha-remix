import type { Team } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { teamValidator } from '~/services/team/team.schema'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { FormGridItem } from '../FormFields/FormGridItem'
import { Input } from '../FormFields/Input'
import { SubmitButton } from '../SubmitButton'
import { ButtonColorVariants } from '../Button'

interface TeamFormProps {
  actions: JSX.Element
  buttonText: string
  showDeleteButton?: boolean

  defaultValues?: Pick<Team, 'name'>
}

export const TeamForm = ({
  actions,
  buttonText,
  defaultValues,
  showDeleteButton,
}: TeamFormProps) => {
  const { name } = defaultValues || {}

  return (
    <>
      <ValidatedForm
        id="TeamForm"
        validator={teamValidator}
        method="post"
        className="pt-10"
        defaultValues={{ name }}
      >
        <Box className="p-5 shadow-sm">
          <Title className="pb-5 pl-2 pt-2 text-xl">Nuevo equipo</Title>
          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="name"
                type="text"
                label="Nombre del equipo"
                placeholder="Ej: Ventas"
              />
            </FormGridItem>
          </FormGridWrapper>
        </Box>
        {actions}
      </ValidatedForm>

      {showDeleteButton && (
        <Form method="delete">
          <SubmitButton variant={ButtonColorVariants.WARNING}>
            Eliminar
          </SubmitButton>
        </Form>
      )}
    </>
  )
}
