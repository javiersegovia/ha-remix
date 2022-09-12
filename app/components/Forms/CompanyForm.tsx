import type {
  Company,
  CompanyCategory,
  CompanyContactPerson,
  Country,
} from '@prisma/client'
import { CompanyStatus } from '@prisma/client'
import type { Validator } from 'remix-validated-form'
import { ValidatedForm } from 'remix-validated-form'

import type { CompanySchemaInput } from '~/services/company/company.schema'
import type { getCompanyCategories } from '~/services/company/company-category.server'
import type { getCountries } from '~/services/country/country.server'

import type { EnumOption } from '~/schemas/helpers'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { SelectMultiple } from '../FormFields/SelectMultiple'

const companyStatusList: EnumOption[] = [
  { name: 'Activa', value: CompanyStatus.ACTIVE },
  { name: 'Inactiva', value: CompanyStatus.INACTIVE },
]

interface CompanyFormProps<T = CompanySchemaInput> {
  actions: JSX.Element
  companyCategories: Awaited<ReturnType<typeof getCompanyCategories>>
  countries: Awaited<ReturnType<typeof getCountries>>
  validator: Validator<T>
  defaultValues?: Pick<
    Company,
    | 'address'
    | 'description'
    | 'dispersion'
    | 'lastRequestDay'
    | 'premiumDispersion'
    | 'premiumLastRequestDay'
    | 'premiumPaymentDays'
    | 'paymentDays'
    | 'phone'
    | 'status'
    | 'name'
    | 'countryId'
  > & {
    country?: Pick<Country, 'id'>
    categories?: Pick<CompanyCategory, 'id'>[]
    contactPerson?: Pick<
      CompanyContactPerson,
      'firstName' | 'lastName' | 'phone'
    >
  }
}

export const CompanyForm = ({
  defaultValues,
  actions,
  companyCategories,
  countries,
  validator,
}: CompanyFormProps) => {
  const {
    address,
    description,
    dispersion,
    lastRequestDay,
    premiumDispersion,
    premiumLastRequestDay,
    premiumPaymentDays,
    paymentDays,
    phone,
    status,
    name,
    categories,
    countryId,
    contactPerson,
  } = defaultValues || {}

  return (
    <>
      <ValidatedForm
        id="CompanyForm"
        validator={validator}
        method="post"
        defaultValues={{
          address,
          description,
          dispersion,
          lastRequestDay,
          premiumDispersion,
          premiumLastRequestDay,
          premiumPaymentDays,
          paymentDays,
          phone,
          status: status || CompanyStatus.INACTIVE,
          name,
          categoriesIds: categories?.map((cat) => cat.id),
          countryId,
          contactPerson,
        }}
      >
        <Box className="p-5">
          <Title as="h4" className="pb-3">
            Información principal
          </Title>

          <FormGridWrapper>
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
            <FormGridItem className="lg:col-span-12">
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
            <FormGridItem>
              <Select
                name="status"
                label="Estado"
                placeholder="Estado"
                options={companyStatusList}
              />
            </FormGridItem>
          </FormGridWrapper>

          <Title as="h4" className="py-3">
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

          <Title as="h4" className="py-3">
            Adelantos de Nómina
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="lastRequestDay"
                type="number"
                label="Día límite para nuevas solicitudes de adelanto de nómina"
                placeholder="Último día disponible para nuevas solicitudes"
              />
            </FormGridItem>
            <FormGridItem>
              <Input
                name="paymentDays"
                type="text"
                label="Días de pago de adelantos de nómina (separados por comas)"
                placeholder="Días de pago de nómina"
              />
            </FormGridItem>
            <FormGridItem>
              <Input
                name="dispersion"
                type="number"
                label="Dispersión"
                placeholder="Tasa de dispersión"
              />
            </FormGridItem>
          </FormGridWrapper>

          <Title as="h4" className="py-3">
            Adelantos de Prima
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="premiumLastRequestDay"
                type="number"
                label="Día límite para nuevas solicitudes de adelanto de prima"
                placeholder="Último día disponible para nuevas solicitudes"
              />
            </FormGridItem>
            <FormGridItem>
              <Input
                name="premiumPaymentDays"
                type="text"
                label="Días de pago de adelantos de prima (separados por comas)"
                placeholder="Días de pago de prima"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="premiumDispersion"
                type="number"
                label="Dispersión"
                placeholder="Tasa de dispersión"
              />
            </FormGridItem>
          </FormGridWrapper>
          {actions}
        </Box>
      </ValidatedForm>
    </>
  )
}
