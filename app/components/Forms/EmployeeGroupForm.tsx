import type { Benefit, EmployeeGroup } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { ButtonColorVariants } from '~/components/Button'
import { employeeGroupValidator } from '~/services/employee-group/employee-group.schema'
import { SubmitButton } from '../SubmitButton'
import { SelectMultiple } from '../FormFields/SelectMultiple'

interface EmployeeGroupFormProps {
  buttonText: string
  showDeleteButton?: boolean
  benefits: Pick<Benefit, 'id' | 'name'>[]
  defaultValues?: Pick<EmployeeGroup, 'name'> & {
    benefits?: Pick<Benefit, 'id'>[]
  }
}

export const EmployeeGroupForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
  benefits,
}: EmployeeGroupFormProps) => {
  const { name, benefits: defaultBenefits } = defaultValues || {}

  return (
    <>
      <ValidatedForm
        id="EmployeeGroupForm"
        validator={employeeGroupValidator}
        method="post"
        className="pt-10"
        defaultValues={{
          name,
          benefitsIds: defaultBenefits?.map((benefit) => benefit.id),
        }}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="name"
              type="text"
              label="Nombre"
              placeholder="Ingrese un nombre"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <SelectMultiple
              name="benefitsIds"
              label="Beneficios habilitados"
              placeholder="Beneficios habilitados para el grupo"
              options={benefits}
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
