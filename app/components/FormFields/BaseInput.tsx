import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Label } from './Label'
import type { TInput, TInputProps } from './Input'
import { inputBaseStyles, inputDisabledStyles } from './Input'

export const BaseInput: React.FC<TInput> = ({
  name,
  type = 'text',
  label,
  error,
  description,
  required = false,
  disabled,
  isTextArea = false,
  defaultValue,
  className,
  ...otherProps
}: TInputProps) => {
  const Tagname = isTextArea ? 'textarea' : 'input'

  return (
    <Label
      htmlFor={name}
      description={label}
      className={twMerge(clsx('block w-full', className))}
      required={required}
    >
      <Tagname
        {...otherProps}
        id={name}
        type={type}
        name={name}
        className={twMerge(
          clsx(
            inputBaseStyles,
            disabled && inputDisabledStyles,
            isTextArea && 'rounded-xl'
          )
        )}
      />
    </Label>
  )
}
