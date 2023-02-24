import type { BankAccountType } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { bankAccountTypeValidator } from '~/services/bank-account-type/bank-account-type.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface BankAccountTypeFormProps {
  buttonText: string
  defaultValues?: Pick<BankAccountType, 'name'>
  showDeleteButton?: boolean
}

export const BankAccountTypeForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: BankAccountTypeFormProps) => {
  return (
    <>
      <ValidatedForm
        id="BankAccountTypeForm"
        validator={bankAccountTypeValidator}
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
              placeholder="Ingrese un nombre del tipo de cuenta bancaria"
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
