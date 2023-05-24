import type {
  BankAccount,
  Country,
  Employee,
  IdentityDocument,
  User,
} from '@prisma/client'
import type { getBanks } from '~/services/bank/bank.server'
import type { Validator } from 'remix-validated-form'
import type { CompanyDashboardEmployeeSchemaInput } from '~/services/employee/employee.schema'
import type { EnumOption } from '~/schemas/helpers'
import type { getCountries } from '~/services/country/country.server'
import type { getGenders } from '~/services/gender/gender.server'
import type { getJobDepartments } from '~/services/job-department/job-department.server'
import type { getJobPositions } from '~/services/job-position/job-position.server'
import type { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import type { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import type { getUserRoles } from '~/services/user-role/user-role.server'

import { EmployeeStatus } from '@prisma/client'
import { ValidatedForm } from 'remix-validated-form'
import { formatMDYDate } from '~/utils/formatDate'
import { Box } from '../Layout/Box'
import { FormGridItem } from '../FormFields/FormGridItem'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { Title } from '../Typography/Title'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { DatePicker } from '../FormFields/DatePicker'
import { useLocationSync } from '~/hooks/useLocationSync'

const employeeStatusList: EnumOption[] = [
  { name: 'Activo', value: EmployeeStatus.ACTIVE },
  { name: 'Inactivo', value: EmployeeStatus.INACTIVE },
]

interface EmployeeFormProps<T = CompanyDashboardEmployeeSchemaInput> {
  actions: JSX.Element
  countries: Awaited<ReturnType<typeof getCountries>>
  jobPositions: Awaited<ReturnType<typeof getJobPositions>>
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
  genders: Awaited<ReturnType<typeof getGenders>>
  userRoles: Awaited<ReturnType<typeof getUserRoles>>
  validator: Validator<T>
  permissions?: {
    canManageFinancialInformation?: boolean
  }
  defaultValues?: Pick<
    Employee,
    | 'phone'
    | 'address'
    | 'numberOfChildren'
    | 'status'
    | 'roles'
    | 'countryId'
    | 'stateId'
    | 'cityId'
    | 'genderId'
    | 'jobDepartmentId'
    | 'jobPositionId'
    | 'documentIssueDate'
    | 'birthDay'
    | 'inactivatedAt'
    | 'startedAt'
  > & {
    country?: Pick<Country, 'id'> | null
    bankAccount?:
      | (Pick<BankAccount, 'accountNumber' | 'accountTypeId' | 'bankId'> & {
          identityDocument: Pick<IdentityDocument, 'documentTypeId' | 'value'>
        })
      | null
    user: Pick<User, 'email' | 'firstName' | 'lastName' | 'roleId'>
  }
}

export const EmployeeForm = ({
  defaultValues,
  actions,
  jobPositions,
  jobDepartments,
  banks,
  bankAccountTypes,
  identityDocumentTypes,
  countries,
  genders,
  userRoles,
  validator,
  permissions: { canManageFinancialInformation = false } = {},
}: EmployeeFormProps) => {
  const {
    phone,
    address,
    numberOfChildren,
    status,
    roles,
    countryId,
    stateId,
    cityId,
    genderId,
    jobDepartmentId,
    jobPositionId,
    documentIssueDate,
    birthDay,
    user,
    bankAccount,
    inactivatedAt,
    startedAt,
  } = defaultValues || {}

  const formDefaultValues = {
    startedAt,
    inactivatedAt,
    phone,
    address,
    numberOfChildren,
    status: status || EmployeeStatus.INACTIVE,
    roles,
    countryId,
    stateId,
    cityId,
    genderId,
    jobDepartmentId,
    jobPositionId,
    documentIssueDate,
    birthDay,
    user: {
      firstName: user?.firstName || '',
      email: user?.email || '',
      lastName: user?.lastName || '',
      roleId: user?.roleId || '',
    },
    bankAccount:
      canManageFinancialInformation && bankAccount
        ? {
            accountNumber: bankAccount?.accountNumber,
            accountTypeId: bankAccount?.accountTypeId,
            bankId: bankAccount?.bankId,
            identityDocument: {
              documentTypeId: bankAccount?.identityDocument?.documentTypeId,
              value: bankAccount?.identityDocument?.value,
            },
          }
        : undefined,
  }

  const formId = 'EmployeeForm'

  const { stateFetcher, cityFetcher } = useLocationSync({
    formId,
    countryId,
    stateId,
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
              required
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="user.lastName"
              type="text"
              label="Apellido"
              placeholder="Apellido del colaborador"
              required
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="user.email"
              type="text"
              label="Correo electrónico"
              placeholder="Correo electrónico del colaborador"
              required
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
              name="user.roleId"
              label="Rol"
              placeholder="Rol de usuario"
              options={userRoles}
              isClearable
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

        {canManageFinancialInformation && (
          <>
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
          </>
        )}

        {actions}
      </Box>
    </ValidatedForm>
  )
}
