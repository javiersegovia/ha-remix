import type { Table } from '@tanstack/react-table'
import type { getJobDepartments } from '~/services/job-department/job-department.server'
import type { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import type { getAgeRanges } from '~/services/age-range/age-range.server'

import { ValidatedForm } from 'remix-validated-form'
import { ButtonColorVariants, ButtonIconVariants } from '~/components/Button'
import { Input } from '~/components/FormFields/Input'
import { Select } from '~/components/FormFields/Select'
import { formatAgeRange } from '~/utils/formatAgeRange'
import { formatSalaryRange } from '~/utils/formatSalaryRange'
import { employeeSearchValidator } from '~/services/employee/employee-search.schema'
import { Title } from '~/components/Typography/Title'
import { SubmitButton } from '../../components/SubmitButton'

interface TableActionsProps<TData extends unknown> {
  table: Table<TData>
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
  salaryRanges: Awaited<ReturnType<typeof getSalaryRanges>>
  ageRanges: Awaited<ReturnType<typeof getAgeRanges>>
}

export const TableActions = <TData extends unknown>({
  jobDepartments,
  salaryRanges,
  ageRanges,
}: TableActionsProps<TData>) => {
  return (
    <>
      <ValidatedForm validator={employeeSearchValidator} method="get">
        <Title as="h4">Filtros de búsqueda</Title>

        <div className="flex flex-wrap items-center gap-x-3 pt-4 lg:flex-nowrap">
          <Input
            type="text"
            label="Nombre o correo"
            name="keywords"
            placeholder="Ingrese texto..."
          />

          <Select
            name="jobDepartmentId"
            label="Área"
            placeholder="Seleccionar"
            isClearable
            options={jobDepartments}
          />

          <Select
            name="ageRangeId"
            label="Edad"
            placeholder="Seleccionar"
            isClearable
            options={ageRanges?.map(({ id, minAge, maxAge }) => ({
              id,
              name: formatAgeRange(minAge, maxAge),
            }))}
          />

          <Select
            name="salaryRangeId"
            label="Rango salarial"
            placeholder="Seleccionar"
            isClearable
            options={salaryRanges?.map(({ id, minValue, maxValue }) => ({
              id,
              name: formatSalaryRange({ minValue, maxValue }),
            }))}
          />

          <SubmitButton
            type="submit"
            formMethod="GET"
            variant={ButtonColorVariants.PRIMARY}
            icon={ButtonIconVariants.SEARCH}
            size="SM"
            className="mb-5 w-full lg:mb-0 lg:w-auto"
          >
            Filtrar
          </SubmitButton>
        </div>
      </ValidatedForm>
    </>
  )
}
