import type { JobDepartment } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { jobDepartmentValidator } from '~/services/job-department/job-department.schema'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '../SubmitButton'

interface JobDepartmentFormProps {
  buttonText: string
  defaultValues?: Pick<JobDepartment, 'name'>
  showDeleteButton?: boolean
}

export const JobDepartmentForm = ({
  buttonText,
  defaultValues,
  showDeleteButton,
}: JobDepartmentFormProps) => {
  return (
    <>
      <ValidatedForm
        id="JobDepartmentForm"
        validator={jobDepartmentValidator}
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
              placeholder="Ingrese un nombre de área de trabajo"
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
