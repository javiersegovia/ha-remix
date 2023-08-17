import type { Employee, IndicatorActivity } from '@prisma/client'
import type { loader as employeesLoader } from '~/routes/_api.employees'

import debounce from 'lodash.debounce'
import { useFetcher } from '@remix-run/react'
import { useEffect, useMemo } from 'react'
import { ValidatedForm } from 'remix-validated-form'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { FormGridItem } from '../FormFields/FormGridItem'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { indicatorActivityValidator } from '~/services/indicator-activity/indicator-activity.schema'
import { DatePicker } from '../FormFields/DatePicker'
import { formatMDYDate } from '~/utils/formatDate'

interface IndicatorActivityFormProps {
  formId: string
  currentUserEmail?: string
  defaultValues?: Pick<IndicatorActivity, 'value' | 'date'> & {
    employeeId: Employee['id']
  }
}

export const IndicatorActivityForm = ({
  formId,
  currentUserEmail,
  defaultValues,
}: IndicatorActivityFormProps) => {
  const employeesFetcher = useFetcher<typeof employeesLoader>()

  const employeeOptions = useMemo(() => {
    return employeesFetcher?.data?.employees
      ? employeesFetcher.data.employees.map((e) => ({
          id: e.id,
          name: `${e.user.fullName} (${e.user.email})`,
        }))
      : null
  }, [employeesFetcher])

  useEffect(() => {
    if (employeesFetcher.type !== 'init') return

    employeesFetcher.load(`/employees?query=${currentUserEmail}`)
  }, [employeesFetcher, currentUserEmail])

  const handleEmployeeInputChange = debounce((keywords) => {
    if (keywords) {
      employeesFetcher.load(`/employees?query=${keywords}`)
    }
  }, 300)

  return (
    <>
      <ValidatedForm
        id={formId}
        validator={indicatorActivityValidator}
        method="post"
        className="pt-10"
        defaultValues={{
          ...defaultValues,
          date: defaultValues?.date || new Date(),
        }}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="value"
              type="text"
              label="Valor"
              placeholder="Ej: 5000"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <DatePicker
              name="date"
              label="Fecha"
              placeholder="Ingresar fecha"
              maxDate={formatMDYDate(new Date())}
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Select
              name="employeeId"
              label="Colaborador"
              placeholder="Escribe un nombre o correo electrónico"
              options={employeeOptions}
              onInputChange={handleEmployeeInputChange}
              isClearable
            />
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
