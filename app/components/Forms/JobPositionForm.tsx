import type { JobPosition } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { jobPositionValidator } from '~/services/job-position/job-position.schema'
import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface JobPositionFormProps {
  buttonText: string
  defaultValues?: Pick<JobPosition, 'name'>
  showDeleteButton?: boolean
}

export const JobPositionForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: JobPositionFormProps) => {
  return (
    <>
      <ValidatedForm
        id="JobPositionForm"
        validator={jobPositionValidator}
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
              placeholder="Ingrese un nombre del cargo de trabajo"
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
