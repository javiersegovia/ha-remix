import { useState } from 'react'
import clsx from 'clsx'
import ReactCurrencyInput from 'react-currency-input-field'
import type { RegisterOptions } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'

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
  validations?: RegisterOptions
}

export const CurrencyInput = ({
  name,
  label,
  placeholder,
  error,
  symbol,
}: CurrencyInputProps) => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext()

  const currentValue = watch(name)

  const fieldError: string | undefined =
    error || (errors?.[name]?.message as string)

  const [maskedValue, setMaskedValue] = useState(currentValue)

  return (
    <Label
      htmlFor={name}
      description={label}
      className={clsx(
        'block w-full',
        inputBaseStyles,
        !!fieldError && inputErrorStyles
      )}
    >
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, onChange } }) => (
          <>
            <ReactCurrencyInput
              name={`${name}-mask`}
              value={maskedValue}
              placeholder={placeholder}
              prefix={symbol && `${symbol} `}
              onValueChange={(value, __, values) => {
                onChange(values?.float || 0)
                setMaskedValue(value || '0')
              }}
            />

            <input
              value={currentValue}
              name={name}
              type="hidden"
              ref={ref}
              readOnly
            />
          </>
        )}
      />
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
