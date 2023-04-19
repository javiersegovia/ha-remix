import type { AgeRange } from '@prisma/client'

import { ValidatedForm } from 'remix-validated-form'
import { ageRangeValidator } from '~/services/age-range/age-range.schema'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { FormGridItem } from '../FormFields/FormGridItem'
import { Form } from '@remix-run/react'
import { SubmitButton } from '../SubmitButton'
import { ButtonColorVariants } from '../Button'
import { Input } from '../FormFields/Input'

interface AgeRangeFormProps {
  buttonText: string
  defaultValues?: Pick<AgeRange, 'id' | 'minAge' | 'maxAge'>
  showDeleteButton?: boolean
}

export const AgeRangeForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: AgeRangeFormProps) => {
  const { minAge, maxAge } = defaultValues || {}
  return (
    <>
      <ValidatedForm
        id="AgeRangeForm"
        validator={ageRangeValidator}
        method="post"
        className="pt-10"
        defaultValues={{ minAge, maxAge }}
      >
        <FormGridWrapper>
          <FormGridItem className="lg:col-span-12">
            <Input
              name="minAge"
              type="number"
              label="Edad mínima"
              placeholder="Ingresar el rango de tu edad"
            />
          </FormGridItem>
          <FormGridItem className="lg:col-span-12">
            <Input
              name="maxAge"
              type="number"
              label="Edad máxima"
              placeholder="Ingresar el rango de tu edad"
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
