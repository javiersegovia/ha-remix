import type { IdentityDocumentType } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { identityDocumentTypeValidator } from '~/services/identity-document-type/identity-document-type.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface IdentityDocumentTypeFormProps {
  buttonText: string
  defaultValues?: Pick<IdentityDocumentType, 'name'>
  showDeleteButton?: boolean
}

export const IdentityDocumentTypeForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: IdentityDocumentTypeFormProps) => {
  return (
    <>
      <ValidatedForm
        id="IdentityDocumentTypeForm"
        validator={identityDocumentTypeValidator}
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
              placeholder="Ingrese un nombre del tipo de documento de identidad"
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
