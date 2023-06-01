import type { CalculatePremiumAdvanceSchemaInput } from '~/schemas/calculate-premium-advance.schema'
import type { ITaxItem } from '~/services/payroll-advance/payroll-advance.interface'

import { Box } from '~/components/Layout/Box'
import { SubmitButton } from '~/components/SubmitButton'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { CREATE_PREMIUM_ADVANCE_SUBACTION } from '~/routes/dashboard.premium-advances.new'
import { formatMoney } from '~/utils/formatMoney'
import { AdvanceSummaryItem } from './AdvanceSummaryItem'
import { ValidatedForm } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { z } from 'zod'

interface AdvanceTotalCostProps {
  taxItems: ITaxItem[]
  totalAmount: number
  calculationData: CalculatePremiumAdvanceSchemaInput
  action: string
}

export const AdvanceTotalCost = ({
  totalAmount,
  taxItems,
  calculationData,
  action,
}: AdvanceTotalCostProps) => {
  const { requestedAmount, requestReasonId, requestReasonDescription } =
    calculationData

  return (
    <>
      <Box className="w-full p-6">
        <ValidatedForm
          method="post"
          validator={withZod(z.any())}
          action={action}
        >
          <input
            type="hidden"
            name="subaction"
            value={CREATE_PREMIUM_ADVANCE_SUBACTION}
          />
          <input type="hidden" name="requestedAmount" value={requestedAmount} />
          <input type="hidden" name="requestReasonId" value={requestReasonId} />
          <input
            type="hidden"
            name="requestReasonDescription"
            value={requestReasonDescription || undefined}
          />

          <>
            <AdvanceSummaryItem
              label="Dinero solicitado"
              value={formatMoney(requestedAmount, CurrencySymbol.COP)}
            />

            {taxItems.map(({ name, value }) => (
              <AdvanceSummaryItem
                key={name + value}
                label={name}
                value={formatMoney(value, CurrencySymbol.COP)}
              />
            ))}

            <AdvanceSummaryItem
              label={<div className="font-semibold">Descontamos</div>}
              value={
                <div className="font-semibold">
                  {formatMoney(totalAmount, CurrencySymbol.COP)}
                </div>
              }
            />

            <div className="height[1px] my-4 w-full bg-gray-200" />

            <SubmitButton className="mt-6">Solicitar</SubmitButton>
          </>
        </ValidatedForm>
      </Box>
    </>
  )
}
