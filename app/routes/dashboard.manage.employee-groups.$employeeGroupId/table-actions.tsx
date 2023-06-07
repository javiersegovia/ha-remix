import type { Table } from '@tanstack/react-table'
import type { getJobDepartments } from '~/services/job-department/job-department.server'
import type { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import type { getAgeRanges } from '~/services/age-range/age-range.server'

import { FormSubactions } from './route'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { Input } from '~/components/FormFields/Input'
import { Select } from '~/components/FormFields/Select'
import { formatAgeRange } from '~/utils/formatAgeRange'
import { formatSalaryRange } from '~/utils/formatSalaryRange'
import { ValidatedForm } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

interface TableActionsProps<TData extends unknown> {
  table: Table<TData>
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
  salaryRanges: Awaited<ReturnType<typeof getSalaryRanges>>
  ageRanges: Awaited<ReturnType<typeof getAgeRanges>>
}

export const deleteFormId = 'DeleteForm' as const

const searchSchema = z.object({
  keywords: z.string().trim().nullish(),
  jobDepartmentId: zfd.numeric(z.number().int().nullish()),
  ageRangeId: zfd.numeric(z.number().int().nullish()),
  salaryRangeId: zfd.numeric(z.number().int().nullish()),
})

const searchValidator = withZod(searchSchema)

export const TableActions = <TData extends unknown>({
  table,
  jobDepartments,
  salaryRanges,
  ageRanges,
}: TableActionsProps<TData>) => {
  return (
    <>
      <ValidatedForm validator={searchValidator} method="get">
        <div className="flex items-center gap-x-3 pt-4">
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

          <Button
            type="submit"
            formMethod="GET"
            variant={ButtonColorVariants.PRIMARY}
            icon={ButtonIconVariants.SEARCH}
            size="SM"
            className="w-auto"
          >
            Filtrar
          </Button>

          {(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
            <Button
              type="submit"
              name="subaction"
              formMethod="DELETE"
              form={deleteFormId}
              value={FormSubactions.REMOVE_EMPLOYEES}
              variant={ButtonColorVariants.SECONDARY}
              icon={ButtonIconVariants.DELETE}
              size="SM"
              className="w-auto"
            >
              Remover
            </Button>
          )}
        </div>
      </ValidatedForm>
    </>
  )
}
