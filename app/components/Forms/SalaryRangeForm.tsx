import type { SalaryRange } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { salaryRangeValidator } from '~/services/salary-range/salary-range.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface SalaryRangeFormProps {
  buttonText: string
  defaultValues?: Pick<SalaryRange, 'minValue' & 'maxValue'>
  showDeleteButton?: boolean
}

export const SalaryRangeForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: SalaryRangeFormProps) => {
  return (
    <>
      <ValidatedForm
        id="SalaryRangeForm"
        validator={salaryRangeValidator}
        method="post"
        className="pt-10"
        defaultValues={defaultValues}
      >
        <FormGridWrapper>
          <FormGridItem className="lg:col-span-12">
            <Input
              name="minValue"
              type="number"
              label="Valor mínimo"
              placeholder="Ingrese el valor mínimo para el rango salarial"
            />
            <Input
              name="maxValue"
              type="number"
              label="Valor máximo"
              placeholder="Ingrese el valor máximo para el rango salarial"
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
