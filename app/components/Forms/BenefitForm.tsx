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
import { Title } from '../Typography/Title'
import { ImageInput } from '../FormFields/ImageInput'
import { Toggle } from '../FormFields/Toggle'
import { MultiplicableInput } from '../FormFields/MultiplicableInput'

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
        <Title as="h4" className="mb-10">
          Información principal
        </Title>

        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <ImageInput
              name="mainImage"
              alt="Imagen del beneficio"
              currentImageUrl={mainImage?.url}
              currentImageKey={mainImage?.key}
              isCentered
            />
          </FormGridItem>

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

          <FormGridItem isFullWidth>
            <Input
              name="description"
              type="text"
              label="Descripción"
              isTextArea
              placeholder="Ej: Este beneficio te permite acceder a descuentos de hasta el 15% en compras superiores a $50.000"
              description="Min. 180 caracteres — Máx. 600 caracteres"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <MultiplicableInput
              name="instructions"
              label="Paso a paso del uso de este beneficio"
              inputProps={{
                isTextArea: true,
                placeholder: 'Cada campo de texto representa un paso nuevo',
                description: 'Min. 180 caracteres — Máx. 600 caracteres',
              }}
            />
          </FormGridItem>
        </FormGridWrapper>

        <div className="my-10 h-[1px] w-full border-b border-dashed border-gray-300" />

        <Title as="h4" className="my-10">
          Información de beneficio destacado
        </Title>

        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <ImageInput
              name="benefitHighlight.image"
              alt="Imagen del beneficio destacado"
              currentImageUrl={benefitHighlight?.image?.url}
              currentImageKey={benefitHighlight?.image?.key}
              isCentered
            />
          </FormGridItem>

          <FormGridItem>
            <Input name="benefitHighlight.title" label="Título" type="text" />
          </FormGridItem>

          <FormGridItem className="items-center">
            <Toggle
              name="benefitHighlight.isActive"
              label="Destacar beneficio"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="benefitHighlight.description"
              type="text"
              label="Descripción"
              isTextArea
              placeholder="Descripción a destacar"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="benefitHighlight.buttonText"
              label="Texto del botón"
              type="text"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="benefitHighlight.buttonHref"
              label="URL del botón"
              type="text"
            />
          </FormGridItem>
        </FormGridWrapper>
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
