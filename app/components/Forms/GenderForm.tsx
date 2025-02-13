import type { Gender } from '@prisma/client'
import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { ButtonColorVariants } from '~/components/Button'
import { genderValidator } from '~/services/gender/gender.schema'
import { SubmitButton } from '../SubmitButton'

interface GenderFormProps {
  buttonText: string
  defaultValues?: Pick<Gender, 'name'>
  showDeleteButton?: boolean
}

export const GenderForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: GenderFormProps) => {
  return (
    <>
      <ValidatedForm
        id="GenderForm"
        validator={genderValidator}
        method="post"
        className="pt-10"
        defaultValues={defaultValues}
      >
        <FormGridWrapper>
          <FormGridItem className="lg:col-span-12">
            <Input
              name="name"
              type="text"
              label="Nombre"
              placeholder="Ingrese un nombre de género"
            />
          </FormGridItem>
          <FormGridItem className="lg:col-span-12">
            <SubmitButton>{buttonText}</SubmitButton>
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
    </>
  )
}
