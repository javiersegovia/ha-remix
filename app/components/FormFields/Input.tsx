import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import {
  // FieldErrors,
  // FieldError,
  // RegisterOptions,
  useFormContext,
} from 'react-hook-form'
import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'

export const inputBaseStyles =
  'block p-3 w-full text-sm leading-6 bg-white border shadow-sm rounded-[15px] border-gray-300 focus:outline-none focus:ring-1 focus:border-gray-400 focus:ring-gray-400'

export const inputErrorStyles =
  'text-red-600 border-red-500 focus:border-red-500 focus:ring-red-500'

export const inputDisabledStyles =
  'text-gray-500 bg-gray-200 cursor-not-allowed'

type TInputProps = {
  name: string
  type: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  isTextArea?: boolean
  maskFn?: (value: string | number) => string
}

type TInput =
  | (TInputProps & InputHTMLAttributes<HTMLInputElement>)
  | (TInputProps & TextareaHTMLAttributes<HTMLTextAreaElement>)

export const Input: React.FC<TInput> = ({
  name,
  type = 'text',
  label,
  placeholder,
  error,
  disabled,
  isTextArea = false,
  ...otherProps
}: TInputProps) => {
  const Tagname = isTextArea ? 'textarea' : 'input'

  const {
    register,
    formState: { errors },
  } = useFormContext()

  const fieldError: string | undefined =
    error || (errors?.[name]?.message as string)

  return (
    <Label htmlFor={name} description={label} className="block w-full">
      <Tagname
        {...otherProps}
        {...register(name)}
        id={name}
        name={name}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        rows={3}
        className={clsx(
          inputBaseStyles,
          !!fieldError && inputErrorStyles,
          disabled && inputDisabledStyles
        )}
      />
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
