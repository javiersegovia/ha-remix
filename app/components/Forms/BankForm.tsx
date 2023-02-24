import type { Bank } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { bankValidator } from '~/services/bank/bank.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface BankFormProps {
  buttonText: string
  defaultValues?: Pick<Bank, 'name'>
  showDeleteButton?: boolean
}

export const BankForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: BankFormProps) => {
  return (
    <>
      <ValidatedForm
        id="BankForm"
        validator={bankValidator}
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
              placeholder="Ingrese un nombre del banco"
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
