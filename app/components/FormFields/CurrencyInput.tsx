import type { InputHTMLAttributes } from 'react'
import { useState } from 'react'
import clsx from 'clsx'
import { useControlField, useField } from 'remix-validated-form'
import ReactCurrencyInput from 'react-currency-input-field'

import { inputBaseStyles, inputErrorStyles } from './Input'
import { Label } from './Label'
import { ErrorMessage } from './ErrorMessage'
import { useNavigation } from '@remix-run/react'

export enum CurrencySymbol {
  COP = 'COP',
  BUSD = 'BUSD',
}

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue'> {
  name: string
  label?: string
  placeholder?: string
  error?: string
  symbol?: CurrencySymbol
  disabled?: boolean
}

export const CurrencyInput = ({
  name,
  label,
  placeholder,
  error,
  symbol,
  disabled,
}: CurrencyInputProps) => {
  const { error: formError, defaultValue, validate } = useField(name)
  const [value, setValue] = useControlField<number | undefined>(name)
  const { state } = useNavigation()

  const fieldError: string | undefined = error || formError
  const [maskedValue, setMaskedValue] = useState(defaultValue)

  return (
    <Label htmlFor={name} description={label}>
      <>
        <ReactCurrencyInput
          name={`${name}-mask`}
          value={maskedValue}
          defaultValue={defaultValue}
          disabled={disabled || state !== 'idle'}
          placeholder={placeholder}
          prefix={symbol && `${symbol} `}
          onValueChange={(value, __, values) => {
            setValue(values?.float || 0)
            setMaskedValue(value || '0')
            validate()
          }}
          className={clsx(inputBaseStyles, !!fieldError && inputErrorStyles)}
        />

        <input
          type="hidden"
          value={value || ''} // The value should always be defined, even as an empty string instead of undefined
          name={name}
          readOnly
        />
      </>
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
