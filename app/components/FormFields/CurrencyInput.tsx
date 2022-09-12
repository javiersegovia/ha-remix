import { useState } from 'react'
import clsx from 'clsx'
import {
  useControlField,
  useField,
  useIsSubmitting,
} from 'remix-validated-form'
import ReactCurrencyInput from 'react-currency-input-field'

import { inputBaseStyles, inputErrorStyles } from './Input'
import { Label } from './Label'
import { ErrorMessage } from './ErrorMessage'

export enum CurrencySymbol {
  COP = 'COP',
  BUSD = 'BUSD',
}

interface CurrencyInputProps {
  name: string
  label?: string
  placeholder?: string
  error?: string
  symbol?: CurrencySymbol // todo Javier: make this dynamic
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
  const isSubmitting = useIsSubmitting()

  const fieldError: string | undefined = error || formError
  const [maskedValue, setMaskedValue] = useState(defaultValue)

  return (
    <Label htmlFor={name} description={label}>
      <>
        <ReactCurrencyInput
          name={`${name}-mask`}
          value={maskedValue}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          prefix={symbol && `${symbol} `}
          onValueChange={(value, __, values) => {
            setValue(values?.float || 0)
            setMaskedValue(value || '0')
            validate()
          }}
          className={clsx(inputBaseStyles, !!fieldError && inputErrorStyles)}
        />

        <input value={value} name={name} type="hidden" readOnly />
      </>
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
