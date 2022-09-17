import clsx from 'clsx'
import { RiErrorWarningFill } from 'react-icons/ri'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatMoney } from '~/utils/formatMoney'

interface PayrollAdvanceAvailableAmountProps {
  fiatAvailableAmount?: number
  cryptoAvailableAmount?: number
  hasAnAvailableAmount: boolean
  hasAvailableBothAmounts: boolean
  hasActiveAccount: boolean
  hasActiveCompany: boolean
}

interface ErrorTextProps {
  children: React.ReactNode
}

const ErrorText = ({ children }: ErrorTextProps) => {
  return (
    <p className="my-0 flex text-sm text-red-500">
      <RiErrorWarningFill className="mr-2 text-lg" />
      <span className="font-medium">{children}</span>
    </p>
  )
}

export const PayrollAdvanceAvailableAmount = ({
  hasAnAvailableAmount,
  hasAvailableBothAmounts,
  hasActiveAccount,
  hasActiveCompany,
  fiatAvailableAmount = 0,
  cryptoAvailableAmount = 0,
}: PayrollAdvanceAvailableAmountProps) => {
  const isValid = hasAnAvailableAmount && hasActiveAccount && hasActiveCompany
  return (
    <div className="mb-8 text-center">
      <p
        className={clsx(
          'text-base font-medium',
          isValid ? 'text-green-600' : 'text-red-500'
        )}
      >
        {!hasActiveAccount ? (
          <ErrorText>Tu cuenta se encuentra inactiva</ErrorText>
        ) : !hasActiveCompany ? (
          <ErrorText>La cuenta de tu compañía se encuentra inactiva</ErrorText>
        ) : hasAnAvailableAmount ? (
          <span>Monto disponible para adelantos:</span>
        ) : (
          <ErrorText>
            No posees cupo disponible para solicitar adelantos
          </ErrorText>
        )}
      </p>

      {isValid && (
        <p
          className={clsx(
            'inline-block',
            hasAnAvailableAmount ? 'text-green-600' : 'text-red-400'
          )}
        >
          {fiatAvailableAmount > 0 && (
            <span className="font-bold">
              {formatMoney(fiatAvailableAmount)}
            </span>
          )}

          {hasAvailableBothAmounts && <span> o </span>}

          {cryptoAvailableAmount > 0 && (
            <span className="font-bold">
              {formatMoney(cryptoAvailableAmount, CurrencySymbol.BUSD)}
            </span>
          )}
        </p>
      )}

      {isValid && hasAvailableBothAmounts && (
        <>
          <p className="mt-2 rounded-md bg-yellow-100 p-3 text-sm text-yellow-700">
            Al solicitar tu primer adelanto, deberás escoger entre{' '}
            <span className="font-medium">cuenta bancaria</span> y{' '}
            <span className="font-medium">billetera cripto</span> como método de
            cobro. Al escoger una de estas opciones, la otra quedará descartada
            automáticamente durante el resto del mes.
          </p>
        </>
      )}
    </div>
  )
}
