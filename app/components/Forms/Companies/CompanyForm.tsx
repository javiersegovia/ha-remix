import type { CompanyManagementSchemaInput } from '~/services/company/company.schema'
import type { getCompanyCategories } from '~/services/company-category/company-category.server'
import type { getCountries } from '~/services/country/country.server'
import type { getBenefits } from '~/services/benefit/benefit.server'
import type {
  Benefit,
  Company,
  CompanyCategory,
  CompanyContactPerson,
  Country,
  Image,
} from '@prisma/client'
import type { Validator } from 'remix-validated-form'

import { ValidatedForm } from 'remix-validated-form'

import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { Input } from '~/components/FormFields/Input'
import { Select } from '~/components/FormFields/Select'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { SelectMultiple } from '~/components/FormFields/SelectMultiple'
import { ImageInput } from '~/components/FormFields/ImageInput'

interface CompanyFormProps<T = CompanyManagementSchemaInput> {
  actions: JSX.Element
  companyCategories: Awaited<ReturnType<typeof getCompanyCategories>>
  countries: Awaited<ReturnType<typeof getCountries>>
  benefits: Awaited<ReturnType<typeof getBenefits>>
  validator: Validator<T>
  defaultValues?: Pick<
    Company,
    'address' | 'description' | 'phone' | 'name' | 'countryId'
  > & {
    logoImage?: Pick<Image, 'url' | 'key'> | null
    country?: Pick<Country, 'id'> | null
    categories?: Pick<CompanyCategory, 'id'>[]
    benefits?: Pick<Benefit, 'id'>[]
    contactPerson?: Pick<
      CompanyContactPerson,
      'firstName' | 'lastName' | 'phone'
    > | null
  }
}

export const CompanyForm = ({
  defaultValues,
  actions,
  validator,
  benefits,
  companyCategories,
  countries,
}: CompanyFormProps) => {
  const {
    address,
    description,
    phone,
    name,
    categories,
    benefits: defaultBenefits,
    countryId,
    contactPerson,
    logoImage,
  } = defaultValues || {}

  return (
    <>
      <ValidatedForm
        id="CompanyForm"
        validator={validator}
        method="post"
        encType="multipart/form-data"
        defaultValues={{
          address,
          description,
          phone,
          name,
          categoriesIds: categories?.map((cat) => cat.id),
          benefitsIds: defaultBenefits?.map((cat) => cat.id),
          countryId,
          contactPerson,
        }}
      >
        <Box className="p-5">
          <Title as="h2" className="pb-3">
            Información principal
          </Title>

          <FormGridWrapper>
            <FormGridItem isFullWidth>
              <ImageInput
                name="logoImage"
                alt="Logo de la compañía"
                currentImageUrl={logoImage?.url}
                currentImageKey={logoImage?.key}
                isCentered
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="name"
                type="text"
                label="Nombre"
                placeholder="Nombre de la compañía"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="address"
                type="text"
                label="Dirección"
                placeholder="Dirección de la compañía"
              />
            </FormGridItem>

            <FormGridItem isFullWidth>
              <Input
                name="description"
                type="text"
                label="Descripción"
                isTextArea
                placeholder="Descripción de la compañía"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="phone"
                type="text"
                label="Teléfono"
                placeholder="Teléfono de contacto"
              />
            </FormGridItem>

            <FormGridItem>
              <SelectMultiple
                name="categoriesIds"
                label="Sector"
                placeholder="Sector de la compañía"
                options={companyCategories}
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="countryId"
                label="País"
                placeholder="País"
                options={countries}
              />
            </FormGridItem>
          </FormGridWrapper>

          <Title as="h2" className="py-3">
            Persona de contacto
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="contactPerson.firstName"
                type="text"
                label="Nombre"
                placeholder="Nombre de la persona de contacto"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="contactPerson.lastName"
                type="text"
                label="Apellido"
                placeholder="Apellido de la persona de contacto"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="contactPerson.phone"
                type="text"
                label="Teléfono"
                placeholder="Teléfono de la persona contacto"
              />
            </FormGridItem>
          </FormGridWrapper>
        </Box>

        {actions}
      </ValidatedForm>
    </>
  )
}
