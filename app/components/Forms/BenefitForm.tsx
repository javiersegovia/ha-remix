import type { BenefitCategory } from '@prisma/client'
import type { BenefitInputSchema } from '~/services/benefit/benefit.schema'

import { Form, useTransition } from '@remix-run/react'
import { ValidatedForm } from 'remix-validated-form'
import { benefitValidator } from '~/services/benefit/benefit.schema'
import { Button, ButtonColorVariants } from '../Button'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { ImageInput } from '../FormFields/ImageInput'
import { Input } from '../FormFields/Input'
import { Box } from '../Layout/Box'
import { Select } from '../FormFields/Select'

interface BenefitFormProps {
  buttonText: string
  benefitCategories: Pick<BenefitCategory, 'id' | 'name'>[]
  defaultValues?: Pick<
    BenefitInputSchema,
    | 'name'
    | 'imageUrl'
    | 'buttonText'
    | 'buttonHref'
    | 'slug'
    | 'benefitCategoryId'
  > & {
    mainImageUrl?: string
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
    imageUrl,
    buttonText,
    buttonHref,
    slug,
    mainImageUrl,
    benefitCategoryId,
  } = defaultValues || {}

  const transition = useTransition()
  const isLoading = transition.state !== 'idle'

  return (
    <Box className="mt-auto flex w-full flex-col space-y-5 p-5 md:w-auto">
      <ValidatedForm
        id="BenefitForm"
        encType="multipart/form-data"
        validator={benefitValidator}
        defaultValues={{
          name,
          imageUrl,
          buttonText,
          buttonHref,
          slug,
          benefitCategoryId,
        }}
        method="post"
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <ImageInput
              name="mainImage"
              label="Imagen principal"
              alt="Imagen del beneficio"
              currentImageUrl={mainImageUrl}
              isCentered
            />
          </FormGridItem>

          <FormGridItem>
            <Input name="name" label="Nombre" type="text" />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="imageUrl"
              label="URL de la imagen (antiguo)"
              type="text"
            />
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
          disabled={isLoading}
          isLoading={isLoading}
        >
          {formButtonText}
        </Button>

        {showDelete && (
          <Form method="delete" className="inline-block">
            <Button
              type="submit"
              variant={ButtonColorVariants.WARNING}
              className="inline-block w-auto"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Eliminar
            </Button>
          </Form>
        )}
      </div>
    </Box>
  )
}
