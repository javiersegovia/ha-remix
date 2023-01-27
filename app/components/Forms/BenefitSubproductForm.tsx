import type { BenefitSubproduct } from '@prisma/client'

import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'

import { Button } from '../Button'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Input } from '../FormFields/Input'
import { Title } from '../Typography/Title'
import { benefitSubproductValidator } from '~/services/benefit-subproduct/benefit-subproduct.schema'
import { RightPanel } from '../Layout/RightPanel'

interface MembershipFormProps {
  title: string
  buttonText: string
  onCloseRedirectTo: string
  defaultValues?: Pick<BenefitSubproduct, 'name' | 'discount'>
  showDelete?: boolean
}

export const BenefitSubproductForm = ({
  title,
  buttonText,
  defaultValues,
  onCloseRedirectTo,
  showDelete = false,
}: MembershipFormProps) => {
  const { name, discount } = defaultValues || {}

  return (
    <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
      <Title>{title}</Title>
      <ValidatedForm
        id="BenefitSubproductForm"
        validator={benefitSubproductValidator}
        defaultValues={{
          name,
          discount,
        }}
        method="post"
      >
        <FormGridWrapper>
          <FormGridItem className="lg:col-span-12">
            <Input
              name="name"
              label="Nombre"
              type="text"
              placeholder="Nombre de subproducto"
            />
          </FormGridItem>

          <FormGridItem className="lg:col-span-12">
            <Input
              name="discount"
              label="Descuento"
              type="number"
              placeholder="Porcentaje de descuento"
            />
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
    </RightPanel>
  )
}
