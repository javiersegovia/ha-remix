import type { Benefit, Membership } from '@prisma/client'

import { Form, Link } from '@remix-run/react'
import { RiCloseFill } from 'react-icons/ri'
import { ValidatedForm } from 'remix-validated-form'
import type { getBenefits } from '~/services/benefit/benefit.server'

import { membershipValidator } from '~/services/membership/membership.schema'
import { Button, ButtonColorVariants } from '../Button'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Input } from '../FormFields/Input'
import { SelectMultiple } from '../FormFields/SelectMultiple'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

interface MembershipFormProps {
  title: string
  buttonText: string
  onCloseRedirectTo: string
  benefits: Awaited<ReturnType<typeof getBenefits>>
  defaultValues?: Pick<Membership, 'name'> & {
    benefits: Pick<Benefit, 'id'>[]
  }
  showDelete?: boolean
}

export const MembershipForm = ({
  title,
  buttonText,
  defaultValues,
  benefits,
  onCloseRedirectTo,
  showDelete = false,
}: MembershipFormProps) => {
  const { benefits: defaultBenefits, name } = defaultValues || {}

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
          id="MembershipForm"
          validator={membershipValidator}
          defaultValues={{
            name,
            benefitsIds: defaultBenefits?.map((b) => b.id),
          }}
          method="post"
        >
          <FormGridWrapper>
            <FormGridItem className="lg:col-span-12">
              <Input name="name" label="Nombre" type="text" />
            </FormGridItem>

            <FormGridItem className="lg:col-span-12">
              <SelectMultiple
                name="benefitsIds"
                label="Beneficios"
                placeholder="Beneficios asociados"
                options={benefits}
              />
            </FormGridItem>

            <FormGridItem className="lg:col-span-12">
              <Button type="submit">{buttonText}</Button>
            </FormGridItem>
          </FormGridWrapper>
        </ValidatedForm>

        {showDelete && (
          <Form method="delete">
            <Button type="submit" variant={ButtonColorVariants.WARNING}>
              Eliminar
            </Button>
          </Form>
        )}
      </Box>
    </div>
  )
}
