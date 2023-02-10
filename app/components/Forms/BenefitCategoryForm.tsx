import type { BenefitCategory } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { benefitCategoryValidator } from '~/services/benefit-category/benefit-category.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { Button, ButtonColorVariants } from '~/components/Button'

interface BenefitCategoryFormProps {
  buttonText: string
  defaultValues?: Pick<BenefitCategory, 'name' | 'hexColor' | 'opacity'>
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
            <Input
              name="hexColor"
              type="text"
              label="Color HEX"
              placeholder="Ingrese un color en formato hexadecimal"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="opacity"
              type="number"
              step={0.1}
              label="Opacidad"
              placeholder="Ingrese un número entre 0 y 1"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Button type="submit">{buttonText}</Button>
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>

      {showDeleteButton && (
        <Form method="delete">
          <Button type="submit" variant={ButtonColorVariants.WARNING}>
            Eliminar
          </Button>
        </Form>
      )}
    </>
  )
}
