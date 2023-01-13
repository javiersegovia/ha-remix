import type { RequestReason } from '@prisma/client'

import { ValidatedForm } from 'remix-validated-form'
import { CurrencyInput, CurrencySymbol } from '../FormFields/CurrencyInput'
import { Select } from '../FormFields/Select'
import { Input } from '../FormFields/Input'
import { SubmitButton } from '../SubmitButton'
import { calculatePremiumAdvanceValidator } from '~/schemas/calculate-premium-advance.schema'
import { CALCULATE_SUBACTION } from '~/routes/dashboard/premium-advances/new'

interface RequestPremiumAdvanceFormProps {
  requestReasons: Pick<RequestReason, 'id' | 'name'>[]
  hasCalculationData: boolean
}

const calculationFormId = 'PremiumAdvanceCalculationForm' as const

export const RequestPremiumAdvanceForm = ({
  requestReasons,
  hasCalculationData,
}: RequestPremiumAdvanceFormProps) => {
  return (
    <ValidatedForm
      className="space-y-6"
      method="post"
      id={calculationFormId}
      validator={calculatePremiumAdvanceValidator}
      subaction="calculate"
      autoComplete="off"
    >
      <div>
        <CurrencyInput
          name="requestedAmount"
          label="¿Cuánto deseas adelantar?"
          placeholder="Monto a solicitar"
          symbol={CurrencySymbol.COP}
        />
      </div>

      <div>
        <Select
          name="requestReasonId"
          label="Motivo"
          placeholder="¿Para qué deseas el adelanto de prima?"
          options={requestReasons}
        />
      </div>

      <div>
        <Input
          type="text"
          name="requestReasonDescription"
          label="¿En qué lo vas a usar?"
          placeholder="Describe tu motivo aquí"
        />
      </div>

      <input type="hidden" name="subaction" value={CALCULATE_SUBACTION} />

      <SubmitButton variant={!hasCalculationData ? 'PRIMARY' : 'LIGHT'}>
        Calcular
      </SubmitButton>
    </ValidatedForm>
  )
}
