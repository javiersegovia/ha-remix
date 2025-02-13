import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { json, redirect } from '@remix-run/server-runtime'
import { Link, useLoaderData } from '@remix-run/react'
import { ValidatedForm, validationError } from 'remix-validated-form'

import { DatePicker } from '~/components/FormFields/DatePicker'
import { FormActions } from '~/components/FormFields/FormActions'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { Input } from '~/components/FormFields/Input'
import { Label } from '~/components/FormFields/Label'
import { Select } from '~/components/FormFields/Select'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { editAccountValidator } from '~/schemas/edit-account.schema'
import { getBanks } from '~/services/bank/bank.server'
import { getCountries } from '~/services/country/country.server'
import { getCryptocurrencies } from '~/services/crypto-currency/crypto-currency.server'
import { getCryptoNetworks } from '~/services/crypto-network/crypto-network.server'
import { getGenders } from '~/services/gender/gender.server'
import { requireEmployee } from '~/session.server'
import { formatMDYDate, parseISOLocalNullable } from '~/utils/formatDate'
import { updateEmployeeByAccountForm } from '~/services/employee/employee.server'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { Container, ContainerSize } from '~/components/Layout/Container'
import { useLocationSync } from '~/hooks/useLocationSync'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const [
    countries,
    genders,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    cryptocurrencies,
  ] = await Promise.all([
    getCountries(),
    getGenders(),
    getBanks(),
    getBankAccountTypes(),
    getIdentityDocumentTypes(),
    getCryptoNetworks(),
    getCryptocurrencies(),
  ])

  return json({
    employee,
    countries,
    genders,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    cryptocurrencies,
  })
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const { data, submittedData, error } = await editAccountValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await updateEmployeeByAccountForm(data, employee.id)

  return redirect(`/dashboard`)
}

export const meta: MetaFunction = () => {
  return {
    title: 'Mi perfil | HoyTrabajas Beneficios',
  }
}

const formId = 'DashboardAccountForm' as const

export default function DashboardAccountRoute() {
  const {
    employee,
    countries,
    genders,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
  } = useLoaderData<typeof loader>()

  const {
    countryId,
    cityId,
    stateId,
    genderId,
    bankAccount,
    user,
    address,
    phone,
    wallet,
    numberOfChildren,
  } = employee

  const formDefaultValues = {
    ...employee,
    numberOfChildren: numberOfChildren || 0,
    address: address || undefined,
    phone: phone || undefined,
    genderId: genderId || undefined,
    countryId: countryId || undefined,
    stateId,
    cityId,
    bankAccount: {
      ...bankAccount,
      accountNumber: bankAccount?.accountNumber || undefined,
    },
    wallet: {
      address: wallet?.address,
      cryptoNetworkId: wallet?.networkId,
    },
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
    birthDay: parseISOLocalNullable(employee.birthDay),
    documentIssueDate: parseISOLocalNullable(employee.documentIssueDate),
  }

  const { stateFetcher, cityFetcher } = useLocationSync({
    formId,
    countryId,
    stateId,
  })

  return (
    <Container className="w-full py-10" size={ContainerSize.LG}>
      <ValidatedForm
        id={formId}
        method="put"
        validator={editAccountValidator}
        defaultValues={formDefaultValues}
      >
        <Box className="p-5">
          <Title as="h2" className="pb-4 pt-3">
            Mis datos de contacto
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="user.firstName"
                type="text"
                label="Nombres"
                placeholder="Nombre del colaborador"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="user.lastName"
                type="text"
                label="Apellidos"
                placeholder="Apellido del colaborador"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="user.email"
                type="text"
                label="Correo electrónico"
                placeholder="Correo electrónico del colaborador"
                disabled
              />
            </FormGridItem>

            <FormGridItem className="mb-6 lg:mb-0">
              <Label htmlFor={''} description="Contraseña" />
              <Link
                to="/update-password"
                className="mt-auto text-sm font-medium text-steelBlue-600 underline"
              >
                Modificar contraseña
              </Link>
            </FormGridItem>
          </FormGridWrapper>

          <Title as="h2" className="pb-4 pt-3">
            Mis datos personales
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Select
                name="countryId"
                label="País"
                placeholder="País"
                options={countries}
                isClearable
                onSelectChange={(id) => {
                  stateFetcher.load(`/states?countryId=${id}`)
                }}
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="stateId"
                label="Departamento"
                placeholder="Seleccionar departamento"
                options={stateFetcher?.data?.states || []}
                isClearable
                onSelectChange={(id) => {
                  cityFetcher.load(`/cities?stateId=${id}`)
                }}
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="cityId"
                label="Ciudad"
                placeholder="Seleccionar ciudad"
                options={cityFetcher?.data?.cities || []}
                isClearable
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="address"
                type="text"
                label="Dirección"
                placeholder="Dirección completa"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="phone"
                type="text"
                label="Número de celular"
                placeholder="Incluye el código del país. (ej: +57...)"
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="genderId"
                label="Género"
                placeholder="Seleccionar género"
                options={genders}
              />
            </FormGridItem>

            <FormGridItem>
              <DatePicker
                name="birthDay"
                label="Fecha de nacimiento"
                placeholder="Ingresar fecha de nacimiento"
                maxDate={formatMDYDate(
                  new Date(new Date().getFullYear() - 18, 0)
                )}
              />
            </FormGridItem>

            <FormGridItem>
              <DatePicker
                name="documentIssueDate"
                label="Fecha de expedición de documento"
                placeholder="Ingresar fecha de expedición de documento"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="numberOfChildren"
                type="number"
                label="Cantidad de hijos"
                placeholder="Si no tienes, deja el campo en 0"
              />
            </FormGridItem>
          </FormGridWrapper>

          <Title as="h2" className="pb-4 pt-3">
            Mis datos bancarios
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Select
                name="bankAccount.bankId"
                label="Banco"
                placeholder="Banco"
                options={banks}
                disabled
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="bankAccount.accountTypeId"
                label="Tipo de cuenta"
                placeholder="Tipo de cuenta bancaria"
                options={bankAccountTypes}
                disabled
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="bankAccount.accountNumber"
                type="text"
                label="Número de cuenta"
                placeholder="Número de cuenta bancaria"
                disabled
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="bankAccount.identityDocument.documentTypeId"
                label="Tipo de documento"
                placeholder="Tipo de documento de identidad"
                options={identityDocumentTypes}
                disabled
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="bankAccount.identityDocument.value"
                type="text"
                label="Documento de identidad"
                placeholder="Número de documento de identidad"
                disabled
              />
            </FormGridItem>
          </FormGridWrapper>

          <FormActions title="Guardar" />
        </Box>
      </ValidatedForm>
    </Container>
  )
}
