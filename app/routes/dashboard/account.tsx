import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import type { CityLoader } from '../__api/cities'
import type { StateLoader } from '../__api/states'

import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { useEffect } from 'react'
import {
  useControlField,
  ValidatedForm,
  validationError,
} from 'remix-validated-form'
import { DatePicker } from '~/components/FormFields/DatePicker'
import { FormActions } from '~/components/FormFields/FormActions'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { Input } from '~/components/FormFields/Input'
import { Label } from '~/components/FormFields/Label'
import { Select } from '~/components/FormFields/Select'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { useCleanForm } from '~/hooks/useCleanForm'
import { editAccountValidator } from '~/schemas/edit-account.schema'
import { getBanks } from '~/services/bank/bank.server'
import { getCountries } from '~/services/country/country.server'
import { getCryptocurrencies } from '~/services/crypto-currency/crypto-currency.server'
import { getCryptoNetworks } from '~/services/crypto-network/crypto-network.server'
import { getGenders } from '~/services/gender/gender.server'
import { requireEmployee } from '~/session.server'
import { formatMDYDate } from '~/utils/formatDate'
import { updateEmployeeByAccountForm } from '~/services/employee/employee.server'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'

type LoaderData = {
  employee: Awaited<ReturnType<typeof requireEmployee>>
  countries: Awaited<ReturnType<typeof getCountries>>
  genders: Awaited<ReturnType<typeof getGenders>>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
  cryptocurrencies: Awaited<ReturnType<typeof getCryptocurrencies>>
}

export const loader: LoaderFunction = async ({ request }) => {
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

  return json<LoaderData>({
    employee,
    countries,
    genders,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    cryptocurrencies,
  })
}

export const action: ActionFunction = async ({ request }) => {
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
    title: 'Mi perfil | HoyAdelantas',
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
  } = useLoaderData<LoaderData>()

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

  const [countryIdValue] = useControlField<number | undefined>(
    'countryId',
    formId
  )

  const [stateIdValue, setStateIdValue] = useControlField<number | undefined>(
    'stateId',
    formId
  )
  const [cityIdValue, setCityIdValue] = useControlField<number | undefined>(
    'cityId',
    formId
  )

  const stateFetcher = useFetcher<StateLoader>()
  const cityFetcher = useFetcher<CityLoader>()

  useEffect(() => {
    if (stateFetcher.type !== 'init' || !countryId) return
    stateFetcher.load(`/states?countryId=${countryId}`)
  }, [stateFetcher, countryId, countryIdValue])

  useEffect(() => {
    if (cityFetcher.type !== 'init' || !stateId) return
    cityFetcher.load(`/cities?stateId=${stateId}`)
  }, [cityFetcher, stateId])

  useCleanForm({
    options: stateFetcher.data?.states,
    value: stateIdValue,
    setValue: setStateIdValue,
  })

  useCleanForm({
    shouldClean:
      !stateFetcher.data?.states ||
      stateFetcher.data?.states?.length === 0 ||
      !cityFetcher.data?.cities ||
      cityFetcher.data?.cities.length === 0,
    options: cityFetcher.data?.cities,
    value: cityIdValue,
    setValue: setCityIdValue,
  })

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
    birthDay: employee.birthDay ? new Date(employee.birthDay) : null,
    documentIssueDate: employee.documentIssueDate
      ? new Date(employee.documentIssueDate)
      : null,
  }

  return (
    <section className="mx-auto w-full max-w-screen-lg px-2 py-10 sm:px-8">
      <ValidatedForm
        id={formId}
        method="put"
        validator={editAccountValidator}
        defaultValues={formDefaultValues}
      >
        <Box className="p-5">
          <Title as="h1" className="pb-4 pt-3">
            Mis datos
          </Title>

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
                  if (id) {
                    stateFetcher.load(`/states?countryId=${id}`)
                  } else {
                    stateFetcher.load(`/states`)
                  }
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
                  if (id) {
                    cityFetcher.load(`/cities?stateId=${id}`)
                  } else {
                    cityFetcher.load(`/cities`)
                  }
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

          {/* <Title as="h2" className="pb-4 pt-3">
            Billetera cripto
          </Title>

          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="wallet.address"
                type="text"
                label="Dirección de la billetera"
                placeholder="Dirección de la billetera"
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="wallet.cryptoNetworkId"
                label="Red"
                placeholder="Red"
                options={cryptoNetworks}
                isClearable
              />
            </FormGridItem>
          </FormGridWrapper> */}

          <FormActions title="Guardar" />
        </Box>
      </ValidatedForm>
    </section>
  )
}
