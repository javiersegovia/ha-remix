import type { CompanyCategory } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { companyCategoryValidator } from '~/services/company-category/company-category.schema'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { Button, ButtonColorVariants } from '~/components/Button'

interface CompanyCategoryFormProps {
  buttonText: string
  defaultValues?: Pick<CompanyCategory, 'name'>
  showDeleteButton?: boolean
}

export const CompanyCategoryForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: CompanyCategoryFormProps) => {
  return (
    <>
      <ValidatedForm
        id="CompanyCategoryForm"
        validator={companyCategoryValidator}
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
              placeholder="Agregue un nombre de categoría de compañía"
            />
          </FormGridItem>
          <FormGridItem className="lg:col-span-12">
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
