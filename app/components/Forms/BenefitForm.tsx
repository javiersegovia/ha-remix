import type { Benefit } from '@prisma/client'

import { Form, Link } from '@remix-run/react'
import { RiCloseFill } from 'react-icons/ri'
import { ValidatedForm } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { Button } from '../Button'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Input } from '../FormFields/Input'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

interface BenefitFormProps {
  title: string
  buttonText: string
  onCloseRedirectTo: string
  defaultValues?: Pick<Benefit, 'name'>
  showDelete?: boolean
}

export const BenefitForm = ({
  title,
  buttonText,
  defaultValues,
  onCloseRedirectTo,
  showDelete = false,
}: BenefitFormProps) => {
  return (
    <div className="mt-auto h-full w-full md:ml-auto md:max-w-lg">
      <Box className="mt-auto flex w-full flex-col space-y-5 rounded-none p-5 md:min-h-screen md:w-auto">
        <Link
          to={onCloseRedirectTo}
          className="ml-auto flex gap-3 text-steelBlue-400"
        >
          <RiCloseFill className="text-2xl" />
          <span className="tracking-widest">Cerrar</span>
        </Link>

        <Title>{title}</Title>

        <ValidatedForm
          id="BenefitForm"
          validator={benefitValidator}
          defaultValues={defaultValues}
          method="post"
        >
          <FormGridWrapper>
            <FormGridItem className="lg:col-span-12">
              <Input name="name" label="Nombre" type="text" />
            </FormGridItem>

            <FormGridItem className="lg:col-span-12">
              <Button type="submit">{buttonText}</Button>
            </FormGridItem>
          </FormGridWrapper>
        </ValidatedForm>

        {showDelete && (
          <Form method="delete">
            <Button type="submit" variant="WARNING">
              Eliminar
            </Button>
          </Form>
        )}
      </Box>
    </div>
  )
}
