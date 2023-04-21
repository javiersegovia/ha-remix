import type { SalaryRange } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { salaryRangeValidator } from '~/services/salary-range/salary-range.schema'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import {
  CurrencyInput,
  CurrencySymbol,
} from '~/components/FormFields/CurrencyInput'

import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface SalaryRangeFormProps {
  buttonText: string
  defaultValues?: Pick<SalaryRange, 'id' | 'minValue' | 'maxValue'>
  showDeleteButton?: boolean
}

export const SalaryRangeForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: SalaryRangeFormProps) => {
  const { minValue, maxValue } = defaultValues || {}
  return (
    <>
      <ValidatedForm
        id="SalaryRangeForm"
        validator={salaryRangeValidator}
        method="post"
        className="pt-10"
        defaultValues={{ minValue, maxValue }}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <CurrencyInput
              name="minValue"
              type="number"
              label="Valor mínimo"
              placeholder="Ingrese el valor mínimo para el rango salarial"
              symbol={CurrencySymbol.COP}
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <CurrencyInput
              name="maxValue"
              type="number"
              label="Valor máximo"
              placeholder="Ingrese el valor máximo para el rango salarial"
              symbol={CurrencySymbol.COP}
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
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
