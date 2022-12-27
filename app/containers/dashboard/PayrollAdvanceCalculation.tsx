import { z } from 'zod'
import { withZod } from '@remix-validated-form/with-zod'
import { PayrollAdvancePaymentMethod } from '@prisma/client'
import { useControlField, ValidatedForm } from 'remix-validated-form'

import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { Box } from '~/components/Layout/Box'
import { Checkbox } from '~/components/FormFields/Checkbox'
import { SubmitButton } from '~/components/SubmitButton'
import { formatMoney } from '~/utils/formatMoney'
import { PayrollAdvanceSummaryItem } from './PayrollAdvanceSummaryItem'

import type { calculatePayrollAdvance } from '~/services/payroll-advance/payroll-advance.server'

interface PayrollAdvanceCalculationProps {
  calculation: NonNullable<
    Awaited<ReturnType<typeof calculatePayrollAdvance>>['data']
  >
}

/** We use "any" just to bypass the required validator at ValidatedForm.
 *  We use "ValidatedForm" instead of the default Remix "Form" to be able to use controlled data (The checkbox mainly)
 */
const anyValidator = withZod(z.any())

const requestPayrollAdvanceFormId = 'RequestedPayrollAdvanceForm'
export const PayrollAdvanceCalculation = ({
  calculation,
}: PayrollAdvanceCalculationProps) => {
  const {
    requestedAmount,
    taxItems,
    totalAmount,
    paymentMethod,
    requestReasonId,
    requestReasonDescription,
  } = calculation

  // const {
  //   data: estimatedGas,
  //   isLoading: isLoadingGasFee,
  //   estimatedGasFormatted,
  // } = useEstimatedGasFeeQuery({ address, requestedAmount })

  // todo: add estimatedGasFee for crypto payments

  const [acceptedTerms] = useControlField<boolean>(
    'acceptedTerms',
    requestPayrollAdvanceFormId
  )

  const currencySymbol =
    paymentMethod === PayrollAdvancePaymentMethod.WALLET
      ? CurrencySymbol.BUSD
      : CurrencySymbol.COP

  // const estimatedGasValue = isLoadingGasFee
  //   ? 'Calculando...'
  //   : estimatedGasFormatted || <span className="text-red-500">Error</span>

  // const totalCost =
  //   address && estimatedGas ? totalAmount + Number(estimatedGas) : totalAmount
  const totalCost = totalAmount

  return (
    <>
      <Box className="w-full p-6">
        <ValidatedForm
          id={requestPayrollAdvanceFormId}
          validator={anyValidator}
          method="post"
          action="/dashboard/payroll-advances/new"
          subaction="request"
        >
          <input type="hidden" name="paymentMethod" value={paymentMethod} />
          <input type="hidden" name="requestedAmount" value={requestedAmount} />
          <input type="hidden" name="requestReasonId" value={requestReasonId} />
          <input
            type="hidden"
            name="requestReasonDescription"
            value={requestReasonDescription || undefined}
          />

          <>
            <PayrollAdvanceSummaryItem
              label="Dinero solicitado"
              value={formatMoney(requestedAmount, currencySymbol)}
            />

            {taxItems.map(({ name, value }) => (
              <PayrollAdvanceSummaryItem
                key={name + value}
                label={name}
                value={formatMoney(value, currencySymbol)}
              />
            ))}

            {/* {address && (
              <PayrollAdvanceSummaryItem
                label="Costo aproximado de transferencia (*)"
                value={estimatedGasValue}
              />
            )} */}

            <PayrollAdvanceSummaryItem
              label={<div className="font-semibold">Descontamos</div>}
              value={
                <div className="font-semibold">
                  {formatMoney(totalCost, currencySymbol)}
                </div>
              }
            />

            <div className="height[1px] my-4 w-full bg-gray-200" />

            {paymentMethod === PayrollAdvancePaymentMethod.WALLET && (
              <>
                <p className="text-justify text-xs text-gray-700">
                  (*) El costo de la transferencia puede variar y será calculado
                  en el momento en el que el pago sea efectuado. Al realizar la
                  solicitud, aceptas una posible diferencia en el costo de
                  transferencia, y por ende, en el monto total a descontar.
                </p>
                <div className="height[1px] my-4 w-full bg-gray-200" />
              </>
            )}

            <Checkbox
              name="acceptedTerms"
              label="Estoy de acuerdo con que el monto total de esta cotización sea descontado de mi próximo salario."
            />

            <SubmitButton className="mt-6" disabled={!acceptedTerms}>
              Solicitar
            </SubmitButton>
          </>
        </ValidatedForm>
      </Box>
    </>
  )
}
