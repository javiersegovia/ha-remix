import type { CompanyPoints } from '@prisma/client'

import { ValidatedForm } from 'remix-validated-form'

import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { FormGridItem } from '../FormFields/FormGridItem'
import { Input } from '../FormFields/Input'
import { companyPointsValidator } from '~/services/company-points/company-points.schema'

interface CompanyPointsFormProps {
  formId: string
  defaultValues?: Pick<
    CompanyPoints,
    'estimatedBudget' | 'currentBudget' | 'circulatingPoints' | 'spentPoints'
  >
}

export const CompanyPointsForm = ({
  formId,
  defaultValues,
}: CompanyPointsFormProps) => {
  return (
    <>
      <ValidatedForm
        id={formId}
        validator={companyPointsValidator}
        method="post"
        className="pt-10"
        defaultValues={defaultValues}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="estimatedBudget"
              type="text"
              label="Presupuesto estimado"
              placeholder="Ej: 5000"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="currentBudget"
              type="text"
              label="Presupuesto actual"
              placeholder="Ej: 5000"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="circulatingPoints"
              type="text"
              label="Puntos en circulación"
              placeholder="Ej: 5000"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="spentPoints"
              type="text"
              label="Puntos consumidos"
              placeholder="Ej: 5000"
            />
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
