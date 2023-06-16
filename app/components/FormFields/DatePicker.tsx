import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { inputBaseStyles, inputDisabledStyles, inputErrorStyles } from './Input'
import { useField } from 'remix-validated-form'
import clsx from 'clsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigation } from '@remix-run/react'

type d = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0
type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type DD = `${0}${oneToNine}` | `${1 | 2}${d}` | `3${0 | 1}`
type MM = `0${oneToNine}` | `1${0 | 1 | 2}`
type YYYY = `19${d}${d}` | `20${d}${d}`

export type DateMDYString = `${MM}-${DD}-${YYYY}`

interface DatePickerProps {
  name: string
  label?: string
  placeholder?: string
  error?: string
  minDate?: DateMDYString
  maxDate?: DateMDYString
  disabled?: boolean
}

export const DatePicker = ({
  name,
  label,
  placeholder,
  error,
  minDate = undefined,
  maxDate = undefined,
  disabled,
}: DatePickerProps) => {
  const { error: formError, defaultValue, getInputProps } = useField(name)
  const { state } = useNavigation()
  const fieldError: string | undefined = error || formError

  const fieldDefault = defaultValue
    ? format(defaultValue, 'yyyy-MM-dd', {
        locale: es,
      })
    : undefined

  // todo: check defaultValue and minDate/maxDate in different browsers (cypress?)
  return (
    <Label htmlFor={name} description={label} className="block w-full">
      <input
        name={name}
        {...getInputProps({
          id: name,
          type: 'date',
          // We want do disable the ability to modify the form while we are submitting...
          // BUT if we use the "disabled" field, the data won't be submitted. That's why we use readonly.
          // See details: https://stackoverflow.com/a/7357314/10653675
          readOnly: disabled || state !== 'idle',
          min: minDate,
          max: maxDate,
          placeholder,
          className: clsx(
            inputBaseStyles,
            !!fieldError && inputErrorStyles,
            (disabled || state !== 'idle') && inputDisabledStyles
          ),
        })}
        defaultValue={fieldDefault}
      />
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
