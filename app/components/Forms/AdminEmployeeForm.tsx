import type {
  BankAccount,
  Country,
  Employee,
  IdentityDocument,
  User,
  Wallet,
} from '@prisma/client'
import type { getBanks } from '~/services/bank/bank.server'
import type { loader as cityLoader } from '~/routes/__api/cities'
import type { loader as stateLoader } from '~/routes/__api/states'
import type { Validator } from 'remix-validated-form'
import type { EmployeeSchemaInput } from '~/services/employee/employee.schema'
import type { EnumOption } from '~/schemas/helpers'
import type { getCountries } from '~/services/country/country.server'
import type { getCryptoNetworks } from '~/services/crypto-network/crypto-network.server'
import type { getCurrencies } from '~/services/currency/currency.server'
import type { getCryptocurrencies } from '~/services/crypto-currency/crypto-currency.server'
import type { getGenders } from '~/services/gender/gender.server'
import type { getJobDepartments } from '~/services/job-department/job-department.server'
import type { getJobPositions } from '~/services/job-position/job-position.server'
import type { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import type { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import type { getMemberships } from '~/services/membership/membership.server'
import type { getUserRoles } from '~/services/user-role/user-role.server'

import { useEffect } from 'react'
import { EmployeeStatus } from '@prisma/client'
import { useControlField, ValidatedForm } from 'remix-validated-form'
import { useFetcher } from '@remix-run/react'
import { formatMDYDate } from '~/utils/formatDate'
import { useCleanForm } from '~/hooks/useCleanForm'
import { Box } from '../Layout/Box'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Title } from '../Typography/Title'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { DatePicker } from '../FormFields/DatePicker'
import { CurrencyInput, CurrencySymbol } from '../FormFields/CurrencyInput'

const employeeStatusList: EnumOption[] = [
  { name: 'Activo', value: EmployeeStatus.ACTIVE },
  { name: 'Inactivo', value: EmployeeStatus.INACTIVE },
]

interface AdminEmployeeFormProps<T = EmployeeSchemaInput> {
  actions: JSX.Element
  countries: Awaited<ReturnType<typeof getCountries>>
  jobPositions: Awaited<ReturnType<typeof getJobPositions>>
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
  genders: Awaited<ReturnType<typeof getGenders>>
  memberships: Awaited<ReturnType<typeof getMemberships>>
  currencies: Awaited<ReturnType<typeof getCurrencies>>
  cryptoNetworks: Awaited<ReturnType<typeof getCryptoNetworks>>
  cryptocurrencies: Awaited<ReturnType<typeof getCryptocurrencies>>
  userRoles: Awaited<ReturnType<typeof getUserRoles>>
  validator: Validator<T>
  defaultValues?: Pick<
    Employee,
    | 'salaryFiat'
    | 'salaryCrypto'
    | 'advanceMaxAmount'
    | 'advanceCryptoMaxAmount'
    | 'advanceAvailableAmount'
    | 'advanceCryptoAvailableAmount'
    | 'phone'
    | 'availablePoints'
    | 'address'
    | 'numberOfChildren'
    | 'status'
    | 'roles'
    | 'countryId'
    | 'stateId'
    | 'cityId'
    | 'genderId'
    | 'currencyId'
    | 'membershipId'
    | 'cryptocurrencyId'
    | 'jobDepartmentId'
    | 'jobPositionId'
    | 'documentIssueDate'
    | 'birthDay'
    | 'inactivatedAt'
    | 'startedAt'
  > & {
    country?: Pick<Country, 'id'> | null
    wallet?: Pick<Wallet, 'address' | 'cryptocurrencyId' | 'networkId'> | null
    bankAccount?:
      | (Pick<BankAccount, 'accountNumber' | 'accountTypeId' | 'bankId'> & {
          identityDocument: Pick<IdentityDocument, 'documentTypeId' | 'value'>
        })
      | null
    user: Pick<User, 'email' | 'firstName' | 'lastName' | 'roleId'>
  }
}

// Todo: add comments to this file explaining what we are doing with the hooks

export const AdminEmployeeForm = ({
  defaultValues,
  actions,
  jobPositions,
  jobDepartments,
  memberships,
  banks,
  bankAccountTypes,
  identityDocumentTypes,
  countries,
  genders,
  cryptoNetworks,
  currencies,
  cryptocurrencies,
  userRoles,
  validator,
}: AdminEmployeeFormProps) => {
  const {
    salaryFiat,
    salaryCrypto,
    advanceMaxAmount,
    advanceCryptoMaxAmount,
    advanceAvailableAmount,
    advanceCryptoAvailableAmount,
    phone,
    availablePoints,
    address,
    numberOfChildren,
    status,
    roles,
    countryId,
    stateId,
    cityId,
    genderId,
    currencyId,
    cryptocurrencyId,
    membershipId,
    jobDepartmentId,
    jobPositionId,
    documentIssueDate,
    birthDay,
    user,
    wallet,
    bankAccount,
    inactivatedAt,
    startedAt,
  } = defaultValues || {}

  const formDefaultValues = {
    salaryFiat,
    salaryCrypto,
    advanceMaxAmount,
    advanceCryptoMaxAmount,
    advanceAvailableAmount,
    advanceCryptoAvailableAmount,
    startedAt,
    inactivatedAt,
    availablePoints,
    phone,
    address,
    numberOfChildren,
    status: status || EmployeeStatus.INACTIVE,
    roles,
    countryId,
    stateId,
    cityId,
    genderId,
    currencyId,
    cryptocurrencyId,
    jobDepartmentId,
    membershipId: membershipId || undefined,
    jobPositionId,
    documentIssueDate,
    birthDay,
    user: {
      firstName: user?.firstName || '',
      email: user?.email || '',
      lastName: user?.lastName || '',
      roleId: user?.roleId || '',
    },
    wallet: {
      address: wallet?.address,
      cryptoNetworkId: wallet?.networkId,
    },
    bankAccount: {
      accountNumber: bankAccount?.accountNumber,
      accountTypeId: bankAccount?.accountTypeId,
      bankId: bankAccount?.bankId,
      identityDocument: {
        documentTypeId: bankAccount?.identityDocument?.documentTypeId,
        value: bankAccount?.identityDocument?.value,
      },
    },
  }

  const formId = 'EmployeeForm'

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

  const stateFetcher = useFetcher<typeof stateLoader>()
  const cityFetcher = useFetcher<typeof cityLoader>()

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

  return (
    <ValidatedForm
      id={formId}
      validator={validator}
      method="post"
      defaultValues={formDefaultValues}
    >
      <Box className="p-5">
        <Title as="h4" className="pb-4 pt-3">
          Cuenta de usuario
        </Title>

        <FormGridWrapper>
          <FormGridItem>
            <Input
              name="user.firstName"
              type="text"
              label="Nombre"
              placeholder="Nombre del colaborador"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="user.lastName"
              type="text"
              label="Apellido"
              placeholder="Apellido del colaborador"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="user.email"
              type="text"
              label="Correo electrónico"
              placeholder="Correo electrónico del colaborador"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="user.password"
              type="password"
              label="Contraseña"
              placeholder="Contraseña del colaborador"
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="status"
              label="Estado"
              placeholder="Estado"
              options={employeeStatusList}
            />
          </FormGridItem>

          <FormGridItem>
            <DatePicker
              name="startedAt"
              label="Fecha de ingreso"
              placeholder="Ingresar fecha de ingreso"
              maxDate={formatMDYDate(new Date())}
            />
          </FormGridItem>

          <FormGridItem>
            <DatePicker
              name="inactivatedAt"
              label="Fecha de retiro"
              placeholder="Ingresar fecha de retiro"
              maxDate={formatMDYDate(new Date())}
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="membershipId"
              label="Membresía"
              placeholder="Membresía"
              options={memberships}
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="user.roleId"
              label="Rol"
              placeholder="Rol de usuario"
              options={userRoles}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="availablePoints"
              type="number"
              label="Puntos disponibles"
              placeholder="Puntos disponibles para redimir"
            />
          </FormGridItem>
        </FormGridWrapper>

        <Title as="h4" className="pb-4 pt-3">
          Información complementaria
        </Title>

        <FormGridWrapper>
          <FormGridItem>
            <Select
              name="jobPositionId"
              label="Cargo"
              placeholder="Cargo que ocupa"
              options={jobPositions}
            />
          </FormGridItem>
          <FormGridItem>
            <Select
              name="jobDepartmentId"
              label="Área"
              placeholder="Área a la que pertenece"
              options={jobDepartments}
            />
          </FormGridItem>

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

        <Title as="h4" className="pb-4 pt-3">
          Cuenta bancaria
        </Title>

        <FormGridWrapper>
          <FormGridItem>
            <Select
              name="bankAccount.bankId"
              label="Banco"
              placeholder="Banco"
              options={banks}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="bankAccount.accountTypeId"
              label="Tipo de cuenta"
              placeholder="Tipo de cuenta bancaria"
              options={bankAccountTypes}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="bankAccount.accountNumber"
              type="text"
              label="Número de cuenta"
              placeholder="Número de cuenta bancaria"
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="bankAccount.identityDocument.documentTypeId"
              label="Tipo de documento"
              placeholder="Tipo de documento de identidad"
              options={identityDocumentTypes}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="bankAccount.identityDocument.value"
              type="text"
              label="Documento de identidad"
              placeholder="Número de documento de identidad"
            />
          </FormGridItem>
        </FormGridWrapper>

        <Title as="h4" className="pb-4 pt-3">
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
        </FormGridWrapper>

        <Title as="h4" className="pb-4 pt-3">
          Salario en moneda fiat
        </Title>

        <FormGridWrapper>
          <FormGridItem>
            <CurrencyInput
              name="salaryFiat"
              label="Salario"
              placeholder="Salario total en moneda fiat"
              symbol={CurrencySymbol.COP}
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="currencyId"
              label="Moneda"
              placeholder="Moneda utilizada para el salario"
              options={currencies}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <CurrencyInput
              name="advanceMaxAmount"
              label="Cupo aprobado en moneda fiat"
              placeholder="Cupo aprobado en moneda fiat"
              symbol={CurrencySymbol.COP}
            />
          </FormGridItem>

          <FormGridItem>
            <CurrencyInput
              name="advanceAvailableAmount"
              label="Cupo disponible en moneda fiat"
              placeholder="Cupo disponible en moneda fiat"
              symbol={CurrencySymbol.COP}
            />
          </FormGridItem>
        </FormGridWrapper>

        <Title as="h4" className="pb-4 pt-3">
          Salario en criptomonedas
        </Title>

        <FormGridWrapper>
          <FormGridItem>
            <CurrencyInput
              name="salaryCrypto"
              label="Salario"
              placeholder="Salario total en criptomonedas"
              symbol={CurrencySymbol.BUSD}
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="cryptocurrencyId"
              label="Criptomoneda"
              placeholder="Criptomoneda utilizada para el salario"
              options={cryptocurrencies}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <CurrencyInput
              name="advanceCryptoMaxAmount"
              label="Cupo aprobado en criptomonedas"
              placeholder="Cupo aprobado en criptomonedas"
              symbol={CurrencySymbol.BUSD}
            />
          </FormGridItem>

          <FormGridItem>
            <CurrencyInput
              name="advanceCryptoAvailableAmount"
              label="Cupo disponible en criptomonedas"
              placeholder="Cupo disponible en criptomonedas"
              symbol={CurrencySymbol.BUSD}
            />
          </FormGridItem>
        </FormGridWrapper>

        {actions}
      </Box>
    </ValidatedForm>
  )
}
