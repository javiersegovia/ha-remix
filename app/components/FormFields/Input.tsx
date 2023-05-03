import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { useField, useIsSubmitting } from 'remix-validated-form'

export const inputBaseStyles =
  'placeholder:text-gray-400 block p-3 w-full text-sm leading-6 bg-white border shadow-sm rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:border-blue-400 focus:ring-blue-400'

export const inputErrorStyles =
  'text-red-600 border-red-500 focus:border-red-500 focus:ring-red-500'

export const inputDisabledStyles =
  'text-gray-500 bg-gray-200 cursor-not-allowed focus:border-transparent focus:ring-0'

type TInputProps = {
  name: string
  type: string
  required?: boolean
  label?: string
  description?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  isTextArea?: boolean
  defaultValue?: string | number | string[] | number[] | null
  maskFn?: (value: string | number) => string
}

type TInput =
  | (Omit<InputHTMLAttributes<HTMLInputElement>, 'defaultValue'> & TInputProps)
  | (Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'defaultValue'> &
      TInputProps)

export const Input: React.FC<TInput> = ({
  name,
  type = 'text',
  label,
  error,
  description,
  required = false,
  disabled,
  isTextArea = false,
  defaultValue,
  ...otherProps
}: TInputProps) => {
  const Tagname = isTextArea ? 'textarea' : 'input'

  const { error: formError, getInputProps } = useField(name)
  const isSubmitting = useIsSubmitting()
  const fieldError: string | undefined = error || formError

  return (
    <Label
      htmlFor={name}
      description={label}
      className="block w-full"
      required={required}
    >
      <Tagname
        {...otherProps}
        {...getInputProps({
          id: name,
          type,
          // We want do disable the ability to modify the form while we are submitting...
          // BUT if we use the "disabled" field, the data won't be submitted. That's why we use readonly.
          // See details: https://stackoverflow.com/a/7357314/10653675
          readOnly: disabled || isSubmitting,
          rows: 3,
          className: clsx(
            inputBaseStyles,
            !!fieldError && inputErrorStyles,
            (disabled || isSubmitting) && inputDisabledStyles
          ),
        })}
        name={name}
      />
      {(description &&
        (fieldError ? (
          <ErrorMessage>{fieldError}</ErrorMessage>
        ) : (
          <p className="text-sm text-gray-400">{description}</p>
        ))) || <ErrorMessage>{fieldError}</ErrorMessage>}
    </Label>
  )
}
