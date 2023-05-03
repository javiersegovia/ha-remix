import type { BenefitCategory, BenefitHighlight, Image } from '@prisma/client'
import type { BenefitInputSchema } from '~/services/benefit/benefit.schema'

import clsx from 'clsx'
import { Form } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'

import { ButtonColorVariants } from '../Button'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Input } from '../FormFields/Input'
import { Box } from '../Layout/Box'
import { Select } from '../FormFields/Select'
import { SubmitButton } from '../SubmitButton'

interface BenefitFormProps {
  buttonText: string
  benefitCategories: Pick<BenefitCategory, 'id' | 'name'>[]
  defaultValues?: Pick<
    BenefitInputSchema,
    | 'name'
    | 'buttonText'
    | 'buttonHref'
    | 'slug'
    | 'benefitCategoryId'
    | 'description'
    | 'instructions'
  > & {
    mainImage?: Pick<Image, 'key' | 'url'> | null
    benefitHighlight:
      | (Pick<
          BenefitHighlight,
          'title' | 'buttonHref' | 'buttonText' | 'description' | 'isActive'
        > & {
          image?: Pick<Image, 'key' | 'url'> | null
        })
      | null
  }
  showDelete?: boolean
}

export const BenefitForm = ({
  buttonText: formButtonText,
  benefitCategories,
  defaultValues,
  showDelete = false,
}: BenefitFormProps) => {
  const {
    name,
    buttonText,
    buttonHref,
    slug,
    mainImage,
    benefitCategoryId,
    description,
    instructions,
    benefitHighlight,
  } = defaultValues || {}

  return (
    <Box className="mt-auto flex w-full flex-col  space-y-5 rounded-xl p-5 md:w-auto">
      <ValidatedForm
        id="BenefitForm"
        encType="multipart/form-data"
        validator={benefitValidator}
        defaultValues={{
          name,
          buttonText,
          buttonHref,
          slug,
          benefitCategoryId,
          description,
          instructions,
          benefitHighlight,
        }}
        method="post"
      >
        <FormGridWrapper>
          <FormGridItem>
            <Input name="name" label="Nombre" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Input name="buttonText" label="Texto del botón" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Input name="buttonHref" label="URL del botón" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="benefitCategoryId"
              label="Categoría"
              placeholder="Seleccione una categoría"
              options={benefitCategories}
              isClearable
            />
          </FormGridItem>

          <FormGridItem
            className={clsx(
              process.env.NODE_ENV !== 'development' && 'invisible h-0 w-0'
            )}
          >
            <Input name="slug" label="Slug (identificador)" type="text" />
          </FormGridItem>
        </FormGridWrapper>
        <FormGridItem isFullWidth>
          <Input
            name="description"
            type="text"
            label="Descripción"
            isTextArea
            placeholder="Ej: Este beneficio te permite acceder a descuentos de hasta el 15% en compras superiores a $50.000"
            description="Min. 180 caracteres max. 600 caracteres"
          />
        </FormGridItem>
        <FormGridItem isFullWidth>
          <Input
            name="instructions"
            type="text"
            label="Paso a paso del uso de este beneficio"
            isTextArea
            placeholder="Ej: Este beneficio te permite acceder a descuentos de hasta el 15% en compras superiores a $50.000"
            description="Min. 180 caracteres max. 600 caracteres"
          />
        </FormGridItem>
      </ValidatedForm>

      <div className="ml-auto flex gap-5">
        <SubmitButton className=" inline-block w-auto" form="BenefitForm">
          {formButtonText}
        </SubmitButton>

        {showDelete && (
          <Form method="delete" className="inline-block">
            <SubmitButton
              variant={ButtonColorVariants.WARNING}
              className="inline-block w-auto"
            >
              Eliminar
            </SubmitButton>
          </Form>
        )}
      </div>
    </Box>
  )
}
