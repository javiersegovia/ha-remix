import type {
  BankAccount,
  Employee,
  IdentityDocument,
  User,
} from '@prisma/client'
import type { StateLoader } from '~/routes/__api/states'
import type { CityLoader } from '~/routes/__api/cities'
import type { getCountries } from '~/services/country/country.server'
import type { getGenders } from '~/services/gender/gender.server'
import type {
  getBankAccountTypes,
  getBanks,
  getIdentityDocumentTypes,
} from '~/services/bank/bank.server'

import { useControlField, ValidatedForm } from 'remix-validated-form'
import { welcomeValidator } from '~/schemas/welcome.schema'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { Title } from '../Typography/Title'
import { useEffect } from 'react'
import { useFetcher } from '@remix-run/react'
import { useCleanForm } from '~/hooks/useCleanForm'
import { DatePicker } from '../FormFields/DatePicker'
import { formatMDYDate } from '~/utils/formatDate'
import { Checkbox } from '../FormFields/Checkbox'
import { SubmitButton } from '../SubmitButton'

interface WelcomeFormProps {
  countries: Awaited<ReturnType<typeof getCountries>>
  genders: Awaited<ReturnType<typeof getGenders>>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
  defaultValues?: Pick<
    Employee,
    | 'phone'
    | 'address'
    | 'numberOfChildren'
    | 'countryId'
    | 'stateId'
    | 'cityId'
    | 'genderId'
    | 'documentIssueDate'
    | 'birthDay'
  > & {
    bankAccount?:
      | (Pick<BankAccount, 'accountNumber' | 'accountTypeId' | 'bankId'> & {
          identityDocument: Pick<IdentityDocument, 'documentTypeId' | 'value'>
        })
      | null
    user: Pick<User, 'email' | 'firstName' | 'lastName'>
  }
}

export const WelcomeForm = ({
  countries,
  genders,
  banks,
  bankAccountTypes,
  identityDocumentTypes,
  defaultValues,
}: WelcomeFormProps) => {
  const {
    countryId,
    cityId,
    stateId,
    genderId,
    birthDay,
    documentIssueDate,
    bankAccount,
    user,
    address,
    phone,
    numberOfChildren,
  } = defaultValues || {}

  const formDefaultValues = {
    numberOfChildren: numberOfChildren || 0,
    birthDay,
    documentIssueDate,
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
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  }

  const formId = 'WelcomeForm'

  const [checkboxIsChecked] = useControlField<boolean | undefined>(
    'acceptedPrivacyPolicyAndTermsOfService',
    formId
  )

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

  return (
    <ValidatedForm
      id={formId}
      method="post"
      validator={welcomeValidator}
      defaultValues={formDefaultValues}
    >
      <Title as="h4" className="pb-4 pt-3">
        Información principal
      </Title>

      <FormGridWrapper>
        <FormGridItem className="flex items-center gap-4">
          <Input
            name="user.firstName"
            type="text"
            label="Nombres"
            placeholder="Nombre del colaborador"
            disabled
          />
          <Checkbox name="check_firstName" />
        </FormGridItem>

        <FormGridItem className="flex items-center gap-4">
          <Input
            name="user.lastName"
            type="text"
            label="Apellidos"
            placeholder="Apellido del colaborador"
            disabled
          />
          <Checkbox name="check_lastName" />
        </FormGridItem>

        <FormGridItem className="flex items-center gap-4">
          <Input
            name="user.email"
            type="text"
            label="Correo electrónico"
            placeholder="Correo electrónico del colaborador"
            disabled
          />
          <Checkbox name="check_email" />
        </FormGridItem>
      </FormGridWrapper>

      <FormGridWrapper className="mt-4">
        {bankAccount?.bankId && (
          <FormGridItem className="flex items-center gap-4">
            <Select
              name="bankAccount.bankId"
              label="Banco"
              placeholder="Banco"
              options={banks}
              disabled
            />
            <Checkbox name="check_bankId" />
          </FormGridItem>
        )}

        {bankAccount?.accountTypeId && (
          <FormGridItem className="flex items-center gap-4">
            <Select
              name="bankAccount.accountTypeId"
              label="Tipo de cuenta"
              placeholder="Tipo de cuenta bancaria"
              options={bankAccountTypes}
              disabled
            />
            <Checkbox name="check_accountTypeId" />
          </FormGridItem>
        )}

        {bankAccount?.accountNumber && (
          <FormGridItem className="flex items-center gap-4">
            <Input
              name="bankAccount.accountNumber"
              type="text"
              label="Número de cuenta"
              placeholder="Número de cuenta bancaria"
              disabled
            />
            <Checkbox name="check_accountNumber" />
          </FormGridItem>
        )}

        {bankAccount?.identityDocument?.documentTypeId && (
          <FormGridItem className="flex items-center gap-4">
            <Select
              name="bankAccount.identityDocument.documentTypeId"
              label="Tipo de documento"
              placeholder="Tipo de documento de identidad"
              options={identityDocumentTypes}
              disabled
            />
            <Checkbox name="check_documentTypeId" />
          </FormGridItem>
        )}

        {bankAccount?.identityDocument?.value && (
          <FormGridItem className="flex items-center gap-4">
            <Input
              name="bankAccount.identityDocument.value"
              type="text"
              label="Documento de identidad"
              placeholder="Número de documento de identidad"
              disabled
            />
            <Checkbox name="check_identityDocumentValue" />
          </FormGridItem>
        )}
      </FormGridWrapper>

      <Title as="h4" className="py-4">
        Información adicional
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
            maxDate={formatMDYDate(new Date(new Date().getFullYear() - 18, 0))}
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

      <FormGridWrapper className="mt-4">
        <FormGridItem>
          <Input
            name="password"
            type="password"
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            autoComplete="off"
          />
        </FormGridItem>

        <FormGridItem>
          <Input
            name="confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="Ingresa de nuevo tu contraseña"
          />
        </FormGridItem>
      </FormGridWrapper>

      <div className="w-full pb-4 pt-10">
        <Checkbox
          name="acceptedPrivacyPolicyAndTermsOfService"
          label={
            <span>
              He leído y estoy de acuerdo con la{' '}
              <a
                className="font-medium underline"
                href="https://global.hoytrabajas.com/politica-privacidad/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidad
              </a>{' '}
              y los{' '}
              <a
                className="font-medium underline"
                href="https://global.hoytrabajas.com/terminos-y-condiciones/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos y Condiciones
              </a>
            </span>
          }
        />
      </div>

      <SubmitButton disabled={!checkboxIsChecked} showSpinner>
        Continuar
      </SubmitButton>
    </ValidatedForm>
  )
}
