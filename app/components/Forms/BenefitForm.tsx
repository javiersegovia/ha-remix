import {
  DataItemType,
  type BenefitCategory,
  type BenefitHighlight,
  type DataItem,
  type Image,
} from '@prisma/client'
import type { EnumOption } from '~/schemas/helpers'
import type { BenefitInputSchema } from '~/services/benefit/benefit.schema'

import clsx from 'clsx'
import { Form } from '@remix-run/react'
import {
  ValidatedForm,
  useControlField,
  useFieldArray,
} from 'remix-validated-form'
import { Fragment, useEffect } from 'react'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { faker } from '@faker-js/faker'

import { benefitValidator } from '~/services/benefit/benefit.schema'

import {
  Button,
  ButtonColorVariants,
  ButtonDesignVariants,
  ButtonIconVariants,
} from '../Button'
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
import { CurrencyInput, CurrencySymbol } from '../FormFields/CurrencyInput'

const dataItemTypeList: EnumOption[] = [
  { name: 'Texto', value: DataItemType.TEXT },
  { name: 'Número', value: DataItemType.NUMBER },
  { name: 'Fecha', value: DataItemType.DATE },
]

interface BenefitFormProps {
  buttonText: string
  benefitCategories: Pick<BenefitCategory, 'id' | 'name'>[]
  defaultValues?: Pick<
    BenefitInputSchema,
    | 'name'
    | 'buttonText'
    | 'buttonHref'
    | 'slug'
    | 'cost'
    | 'benefitCategoryId'
    | 'shortDescription'
    | 'description'
    | 'instructions'
    | 'notificationEmails'
    | 'isHighlighted'
    | 'requireDataItems'
    | 'sendEmailNotifications'
  > & {
    mainImage?: Pick<Image, 'key' | 'url'> | null
    dataItems?: Pick<DataItem, 'id' | 'label' | 'type'>[]
    benefitHighlight:
      | (Pick<
          BenefitHighlight,
          'title' | 'buttonHref' | 'buttonText' | 'description'
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
    cost,
    mainImage,
    benefitCategoryId,
    description,
    shortDescription,
    instructions,
    benefitHighlight,
    isHighlighted,
  } = defaultValues || {}

  const formId = 'BenefitForm'

  const [benefitIsHighlighted] = useControlField<boolean>(
    'isHighlighted',
    formId
  )
  const [requireDataItems] = useControlField<boolean>(
    'requireDataItems',
    formId
  )
  const [sendEmailNotifications, setSendEmailNotifications] =
    useControlField<boolean>('sendEmailNotifications', formId)

  const [dataItems, { push, remove }] = useFieldArray('dataItems', {
    formId,
  })

  useEffect(() => {
    if (requireDataItems && dataItems.length === 0) {
      push({ id: faker.datatype.uuid() })
    }

    if (requireDataItems && !sendEmailNotifications) {
      setSendEmailNotifications(true)
    }
  }, [
    requireDataItems,
    push,
    dataItems.length,
    sendEmailNotifications,
    setSendEmailNotifications,
  ])

  return (
    <Box className="mt-auto flex w-full flex-col  space-y-5 rounded-xl p-5 md:w-auto">
      <ValidatedForm
        id={formId}
        encType="multipart/form-data"
        validator={benefitValidator}
        method="post"
        defaultValues={{
          name,
          buttonText,
          buttonHref,
          slug,
          cost,
          benefitCategoryId,
          description,
          shortDescription,
          instructions,
          benefitHighlight,
          isHighlighted,
          notificationEmails: defaultValues?.notificationEmails,
          requireDataItems: defaultValues?.requireDataItems,
          sendEmailNotifications: defaultValues?.sendEmailNotifications,
          dataItems: defaultValues?.dataItems,
        }}
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

          <FormGridItem
            isFullWidth
            className="relative top-[-24px] flex items-center justify-center text-sm text-steelBlue-800 underline"
          >
            <a
              href="https://drive.google.com/drive/folders/1oZoTWM1fm1HDFdFUBCcSaM6m5cqhqz45?usp=drive_link"
              target="_blank"
              rel="noreferrer noopener"
            >
              Ver banco de imágenes
              <HiOutlineExternalLink className="mx-1 my-3 inline-flex items-center pb-1" />
            </a>
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

          {process.env.NODE_ENV === 'development' && (
            <FormGridItem
              className={clsx(
                process.env.NODE_ENV !== 'development' && 'invisible h-0 w-0'
              )}
            >
              <Input name="slug" label="Slug (identificador)" type="text" />
            </FormGridItem>
          )}

          <FormGridItem>
            <CurrencyInput
              name="cost"
              type="number"
              label="Costo"
              placeholder="Ingrese el costo por cada uso del beneficio"
              symbol={CurrencySymbol.COP}
            />
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

          <FormGridItem isFullWidth>
            <div className="my-10 h-[1px] w-full border-b border-dashed border-gray-300" />
          </FormGridItem>
        </FormGridWrapper>

        <FormGridWrapper>
          <FormGridItem isFullWidth className="items-center">
            <Toggle
              name="requireDataItems"
              label="Solicitar información extra al colaborador"
            />
          </FormGridItem>

          {requireDataItems && (
            <>
              {dataItems.map(({ defaultValue, key }, index) => (
                <Fragment key={key}>
                  <input
                    type="hidden"
                    name={`dataItems[${index}].id`}
                    value={defaultValue?.id}
                  />

                  <FormGridItem
                    isFullWidth
                    className="flex flex-col items-center gap-3 md:flex-row"
                  >
                    <Input
                      name={`dataItems[${index}].label`}
                      type="text"
                      label="Nombre del campo"
                      placeholder="Ej: Fecha en que vas a usar tu día libre"
                    />
                    <Select
                      name={`dataItems[${index}].type`}
                      label="Seleccione el tipo de dato"
                      placeholder="Seleccionar tipo de dato"
                      options={dataItemTypeList}
                    />

                    <Button
                      variant={ButtonColorVariants.WARNING}
                      design={ButtonDesignVariants.FAB}
                      icon={ButtonIconVariants.DELETE}
                      className={clsx(
                        index === 0 && 'cursor-default opacity-0'
                      )}
                      disabled={index === 0}
                      onClick={() => {
                        remove(index)
                      }}
                    />
                  </FormGridItem>
                </Fragment>
              ))}

              <FormGridItem isFullWidth>
                <Button
                  className="md:w-auto"
                  size="XS"
                  variant={ButtonColorVariants.SECONDARY}
                  icon={ButtonIconVariants.CREATE}
                  onClick={() => {
                    push({ id: faker.datatype.uuid() })
                  }}
                >
                  Agregar nuevo campo
                </Button>
              </FormGridItem>

              <FormGridItem isFullWidth>
                <div className="my-10 h-[1px] w-full border-b border-dashed border-gray-300" />
              </FormGridItem>
            </>
          )}

          <FormGridItem isFullWidth className="items-center">
            <Toggle
              name="sendEmailNotifications"
              label="Generar notificationes automáticas"
              isReadOnly={requireDataItems}
            />
          </FormGridItem>

          {sendEmailNotifications && (
            <>
              <FormGridItem isFullWidth>
                <Input
                  name="notificationEmails"
                  type="text"
                  label="Correos asociados"
                  isTextArea
                  placeholder="Agrega uno o más correos electrónicos a donde enviaremos la notificación"
                  description="Puedes agregar múltiples correos separados por punto y coma (;)"
                />
              </FormGridItem>

              <FormGridItem isFullWidth>
                <div className="my-10 h-[1px] w-full border-b border-dashed border-gray-300" />
              </FormGridItem>
            </>
          )}

          <FormGridItem isFullWidth className="items-center">
            <Toggle name="isHighlighted" label="Mostrar como destacado" />
          </FormGridItem>
        </FormGridWrapper>

        {benefitIsHighlighted && (
          <>
            <div className="my-10 h-[1px] w-full border-b border-dashed border-gray-300" />

            <Title as="h4" className="my-10">
              Destacar en el carrusel
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
                <Input
                  name="benefitHighlight.title"
                  label="Título"
                  type="text"
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
          </>
        )}
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
