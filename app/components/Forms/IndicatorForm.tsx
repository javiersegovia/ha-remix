import type { EnumOption } from '~/schemas/helpers'
import { IndicatorType, type Indicator } from '@prisma/client'

import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'

import { indicatorValidator } from '~/services/indicator/indicator.schema'
import { Select } from '../FormFields/Select'

const indicatorTypeList: EnumOption[] = [
  { name: 'Personalizado', value: IndicatorType.CUSTOM },
]

interface IndicatorFormProps {
  formId: string
  defaultValues?: Pick<Indicator, 'name' | 'type'>
}

export const IndicatorForm = ({
  formId,
  defaultValues,
}: IndicatorFormProps) => {
  return (
    <>
      <ValidatedForm
        id={formId}
        validator={indicatorValidator}
        method="post"
        className="pt-10"
        defaultValues={{
          ...defaultValues,
          type: defaultValues?.type || IndicatorType.CUSTOM,
        }}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="name"
              type="text"
              label="Nombre"
              placeholder="Ingrese el nombre del indicador"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Select
              name="type"
              label="Tipo de indicador"
              placeholder="Seleccione un tipo de indicador"
              options={indicatorTypeList}
            />
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
