import type { Country, Employee } from '@prisma/client'
import type { EmployeeExtraInformationSchemaInput } from '~/services/employee/employee.schema'
import type { Validator } from 'remix-validated-form'
import type { getCountries } from '~/services/country/country.server'
import type { getJobPositions } from '~/services/job-position/job-position.server'
import type { getJobDepartments } from '~/services/job-department/job-department.server'
import type { getGenders } from '~/services/gender/gender.server'

import { ValidatedForm } from 'remix-validated-form'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { useLocationSync } from '~/hooks/useLocationSync'
import { DatePicker } from '~/components/FormFields/DatePicker'
import { formatMDYDate } from '~/utils/formatDate'
import { Select } from '~/components/FormFields/Select'
import { Input } from '~/components/FormFields/Input'

interface EmployeeExtraInformationFormProps<
  T = EmployeeExtraInformationSchemaInput
> {
  actions: JSX.Element
  countries: Awaited<ReturnType<typeof getCountries>>
  jobPositions: Awaited<ReturnType<typeof getJobPositions>>
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
  genders: Awaited<ReturnType<typeof getGenders>>
  validator: Validator<T>
  defaultValues?: Pick<
    Employee,
    | 'phone'
    | 'address'
    | 'numberOfChildren'
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
  }
}

export const EmployeeExtraInformationForm = ({
  actions,
  validator,
  defaultValues,
  genders,
  jobPositions,
  jobDepartments,
  countries,
}: EmployeeExtraInformationFormProps) => {
  const {
    phone,
    address,
    numberOfChildren,
    countryId,
    stateId,
    cityId,
    genderId,
    jobDepartmentId,
    jobPositionId,
    documentIssueDate,
    birthDay,
    inactivatedAt,
    startedAt,
  } = defaultValues || {}

  const formId = 'EmployeeExtraInformationForm'

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
      defaultValues={{
        startedAt,
        inactivatedAt,
        phone,
        address,
        numberOfChildren,
        countryId,
        stateId,
        cityId,
        genderId,
        jobDepartmentId,
        jobPositionId,
        documentIssueDate,
        birthDay,
      }}
    >
      <div className="rounded-3xl bg-white p-5">
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
      </div>

      {actions}
    </ValidatedForm>
  )
}
