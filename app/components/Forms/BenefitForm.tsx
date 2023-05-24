import type { BenefitCategory, BenefitHighlight, Image } from '@prisma/client'
import type { BenefitInputSchema } from '~/services/benefit/benefit.schema'

import clsx from 'clsx'
import { Form } from '@remix-run/react'
import {
  ValidatedForm,
  useControlField,
  useFormContext,
} from 'remix-validated-form'
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
    | 'shortDescription'
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
    shortDescription,
    instructions,
    benefitHighlight,
  } = defaultValues || {}

  const formId = 'BenefitForm'

  const [benefitHighlightIsActive] = useControlField('benefitHighlight', formId)

  const x = useFormContext(formId)
  const formData = x.getValues()
  const b = formData.get('benefitHighlight')

  console.log({ b, benefitHighlightIsActive })

  return (
    <Box className="mt-auto flex w-full flex-col  space-y-5 rounded-xl p-5 md:w-auto">
      <ValidatedForm
        id={formId}
        encType="multipart/form-data"
        validator={benefitValidator}
        defaultValues={{
          name,
          buttonText,
          buttonHref,
          slug,
          benefitCategoryId,
          description,
          shortDescription,
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
              name="shortDescription"
              type="text"
              label="Descripción corta"
              placeholder="Ej: Beneficio OnDemand enfocado en el área de salud."
              description="Min. 15 caracteres — Máx. 100 caracteres"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="description"
              type="text"
              label="Descripción"
              isTextArea
              placeholder="Ej: Con este beneficio puedes comunicarte con médicos generales, nutricionistas, psicólogos, yogis, entrenadores físicos y veterinarios desde cualquier lugar y en cualquier momento. Cuida de tu salud y la de tus seres queridos con facilidad."
              description="Min. 15 caracteres — Máx. 600 caracteres"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <MultiplicableInput
              name="instructions"
              label="Paso a paso del uso de este beneficio"
              inputProps={{
                isTextArea: true,
                placeholder: `Describe uno a uno los pasos que deben realizar tus colaboradores para hacer uso de este beneficio. \nPara cada paso agrega un nuevo campo de texto haciendo click en el signo “+”.`,
                description: 'Min. 15 caracteres — Máx. 300 caracteres',
              }}
            />
          </FormGridItem>
        </FormGridWrapper>

        <div className="my-10 h-[1px] w-full border-b border-dashed border-gray-300" />

        <Title as="h4" className="my-10">
          Información de beneficio destacado
        </Title>

        <FormGridItem className="items-center">
          <Toggle
            name="benefitHighlight.isActive"
            label="Es un beneficio destacado"
          />
        </FormGridItem>

        {/* {benefitHighlight?.isActive && ( */}
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
        {/* //  */}
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
