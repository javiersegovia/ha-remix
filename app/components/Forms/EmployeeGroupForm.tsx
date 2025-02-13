import type {
  AgeRange,
  Benefit,
  City,
  Country,
  EmployeeGroup,
  Gender,
  JobDepartment,
  SalaryRange,
  State,
} from '@prisma/client'

import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { employeeGroupValidator } from '~/services/employee-group/employee-group.schema'
import { SelectMultiple } from '../FormFields/SelectMultiple'
import { Select } from '../FormFields/Select'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'
import { formatAgeRange } from '../../utils/formatAgeRange'
import { Form } from '@remix-run/react'
import { SubmitButton } from '../SubmitButton'
import { ButtonColorVariants } from '../Button'
import { formatSalaryRange } from '~/utils/formatSalaryRange'
import { useLocationSync } from '../../hooks/useLocationSync'

interface EmployeeGroupFormProps {
  actions: JSX.Element
  benefits: Pick<Benefit, 'id' | 'name'>[]
  genders: Pick<Gender, 'id' | 'name'>[]
  jobDepartments: Pick<JobDepartment, 'id' | 'name'>[]
  countries: Pick<Country, 'id' | 'name'>[]
  ageRanges: Pick<AgeRange, 'id' | 'minAge' | 'maxAge'>[]
  salaryRanges: Pick<SalaryRange, 'id' | 'minValue' | 'maxValue'>[]
  showDeleteButton?: boolean

  defaultValues?: Pick<EmployeeGroup, 'name'> & {
    benefits?: Pick<Benefit, 'id'>[]
    jobDepartment?: Pick<JobDepartment, 'id'> | null
    country?: Pick<Country, 'id'> | null
    state?: Pick<State, 'id'> | null
    city?: Pick<City, 'id'> | null
    gender?: Pick<Gender, 'id'> | null
    ageRange?: Pick<AgeRange, 'id'> | null
    salaryRange?: Pick<SalaryRange, 'id'> | null
  }
}

export const EmployeeGroupForm = ({
  actions,
  defaultValues,
  benefits,
  genders,
  jobDepartments,
  countries,
  ageRanges,
  salaryRanges,
  showDeleteButton,
}: EmployeeGroupFormProps) => {
  const {
    name,
    benefits: defaultBenefits,
    gender,
    jobDepartment,
    country,
    state,
    city,
    ageRange,
    salaryRange,
  } = defaultValues || {}

  const formId = 'EmployeeGroupForm'

  const { stateFetcher, cityFetcher } = useLocationSync({
    formId,
    countryId: country?.id,
    stateId: state?.id,
  })

  return (
    <>
      <ValidatedForm
        id="EmployeeGroupForm"
        validator={employeeGroupValidator}
        method="post"
        className="pt-10"
        defaultValues={{
          name,
          genderId: gender?.id,
          jobDepartmentId: jobDepartment?.id,
          countryId: country?.id,
          stateId: state?.id,
          cityId: city?.id,
          ageRangeId: ageRange?.id,
          salaryRangeId: salaryRange?.id,
          benefitsIds: defaultBenefits?.map((benefit) => benefit.id),
        }}
      >
        <Box className="p-5 shadow-sm">
          <Title className="pb-5 pl-2 pt-2 text-xl">
            Grupo de colaboradores
          </Title>
          <FormGridWrapper>
            <FormGridItem>
              <Input
                name="name"
                type="text"
                label="Nombre del grupo"
                placeholder="Ej: Talento humano y gestión"
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="countryId"
                label="País"
                placeholder="Seleccionar país"
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
              <Select
                name="jobDepartmentId"
                label="Área"
                placeholder="Seleccionar área"
                options={jobDepartments}
                isClearable
              />
            </FormGridItem>
            <FormGridItem>
              <Select
                name="genderId"
                label="Género"
                placeholder="Seleccionar género"
                options={genders}
                isClearable
              />
            </FormGridItem>
            <FormGridItem>
              <Select
                name="ageRangeId"
                label="Rango de edad"
                placeholder="Seleccionar rango de edad"
                options={ageRanges?.map(({ id, minAge, maxAge }) => ({
                  id,
                  name: formatAgeRange(minAge, maxAge),
                }))}
                isClearable
              />
            </FormGridItem>

            <FormGridItem>
              <Select
                name="salaryRangeId"
                label="Rango de salario"
                placeholder="Seleccionar rango de salario"
                options={salaryRanges?.map(({ id, minValue, maxValue }) => ({
                  id,
                  name: formatSalaryRange({ minValue, maxValue }),
                }))}
                isClearable
              />
            </FormGridItem>

            <FormGridItem isFullWidth>
              <SelectMultiple
                name="benefitsIds"
                label="Beneficios habilitados"
                placeholder="Beneficios habilitados para el grupo"
                options={benefits}
              />
            </FormGridItem>
          </FormGridWrapper>
        </Box>
        {actions}
      </ValidatedForm>

      {showDeleteButton && (
        <Form method="delete">
          <SubmitButton
            className="mt-6 w-auto"
            variant={ButtonColorVariants.WARNING}
          >
            Eliminar
          </SubmitButton>
        </Form>
      )}
    </>
  )
}
