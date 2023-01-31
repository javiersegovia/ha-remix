import type { Benefit } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { Button } from '../Button'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Input } from '../FormFields/Input'
import { Box } from '../Layout/Box'

interface BenefitFormProps {
  buttonText: string
  defaultValues?: Pick<
    Benefit,
    'name' | 'imageUrl' | 'buttonText' | 'buttonHref' | 'slug'
  >
  showDelete?: boolean
}

export const BenefitForm = ({
  buttonText,
  defaultValues,
  showDelete = false,
}: BenefitFormProps) => {
  return (
    <Box className="mt-auto flex w-full flex-col space-y-5 p-5 md:w-auto">
      <ValidatedForm
        id="BenefitForm"
        validator={benefitValidator}
        defaultValues={defaultValues}
        method="post"
      >
        <FormGridWrapper>
          <FormGridItem>
            <Input name="name" label="Nombre" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Input name="imageUrl" label="URL de la imagen" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Input name="buttonText" label="Texto del botón" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Input name="buttonHref" label="URL del botón" type="text" />
          </FormGridItem>

          {process.env.NODE_ENV === 'development' && (
            <FormGridItem>
              <Input name="slug" label="Slug (identificador)" type="text" />
            </FormGridItem>
          )}
        </FormGridWrapper>
      </ValidatedForm>

      <div className="ml-auto flex gap-5">
        <Button
          type="submit"
          className=" inline-block w-auto"
          form="BenefitForm"
        >
          {buttonText}
        </Button>

        {showDelete && (
          <Form method="delete" className="inline-block">
            <Button
              type="submit"
              variant="WARNING"
              className="inline-block w-auto"
            >
              Eliminar
            </Button>
          </Form>
        )}
      </div>
    </Box>
  )
}
