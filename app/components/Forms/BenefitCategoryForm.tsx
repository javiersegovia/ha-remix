import type { BenefitCategory } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { benefitCategoryValidator } from '~/services/benefit-category/benefit-category.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'
import { ColorPicker } from '../FormFields/ColorPicker'

interface BenefitCategoryFormProps {
  buttonText: string
  defaultValues?: Pick<BenefitCategory, 'name' | 'hexColor'>
  showDeleteButton?: boolean
}

export const BenefitCategoryForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: BenefitCategoryFormProps) => {
  return (
    <>
      <ValidatedForm
        id="BenefitCategoryForm"
        validator={benefitCategoryValidator}
        method="post"
        className="pt-10"
        defaultValues={defaultValues}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="name"
              type="text"
              label="Nombre"
              placeholder="Ingrese un nombre de categoría"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <ColorPicker name="hexColor" label="Color de categoría" />
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
