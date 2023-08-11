import type { IndicatorActivity } from '@prisma/client'

import { ValidatedForm } from 'remix-validated-form'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { FormGridItem } from '../FormFields/FormGridItem'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { indicatorActivityValidator } from '~/services/indicator-activity/indicator-activity.schema'

interface IndicatorActivityFormProps {
  formId: string
  defaultValues?: Pick<IndicatorActivity, 'value'>
}

export const IndicatorActivityForm = ({
  formId,
  defaultValues,
}: IndicatorActivityFormProps) => {
  return (
    <>
      <ValidatedForm
        id={formId}
        validator={indicatorActivityValidator}
        method="post"
        className="pt-10"
        defaultValues={{
          ...defaultValues,
        }}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="value"
              type="text"
              label="Valor"
              placeholder="Ingrese un valor"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Select
              name="employeeId"
              label="Colaborador"
              placeholder="Seleccione el colaborador"
              options={[]}
            />
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
