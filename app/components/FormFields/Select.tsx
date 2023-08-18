import clsx from 'clsx'
import React from 'react'
import ReactSelect from 'react-select'
import { ClientOnly } from 'remix-utils'
import { useControlField, useField } from 'remix-validated-form'
import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { selectStyles } from './Select.styles'
import { useNavigation } from '@remix-run/react'

export type TOptionValue = string | number

export type TReactSelectOption =
  | {
      id: TOptionValue
      name: string
    }
  | {
      value: TOptionValue
      name: string
    }

export type TSelectOption = TReactSelectOption | string

export type TSelectProps = Omit<
  React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >,
  'defaultValue'
>

interface SelectProps extends TSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: TSelectOption[] | null | undefined
  error?: string
  isClearable?: boolean
  noOptionsText?: string
  defaultValue?: TSelectOption | null
  onSelectChange?: (newValue?: TOptionValue | null) => void
  onInputChange?: (newValue?: string | null) => void
}

const formatOptions = (
  options?: TSelectOption[] | null
): TReactSelectOption[] => {
  return options
    ? options.map((option) =>
        typeof option === 'string'
          ? {
              id: option,
              name: option,
            }
          : option
      )
    : []
}

export const getSelectValue = (selectedOption?: TReactSelectOption | null) =>
  (selectedOption && 'id' in selectedOption && selectedOption.id) ||
  (selectedOption && 'value' in selectedOption && selectedOption.value) ||
  undefined

export const getSelectOption = (
  options: TReactSelectOption[],
  value: TOptionValue | null | undefined
) =>
  options.find((option) =>
    'value' in option ? option.value === value : option.id === value
  )

export const Select = ({
  name,
  label,
  placeholder,
  options = [],
  error,
  isClearable = false,
  disabled,
  noOptionsText,
  onSelectChange,
  onInputChange,
}: SelectProps) => {
  const { error: formError, defaultValue, validate } = useField(name)
  const [value, setValue] = useControlField<TOptionValue | undefined>(name)
  const { state } = useNavigation()

  const fieldError: string | undefined = error || formError
  const styles = selectStyles<false>(!!fieldError)
  const formattedOptions = formatOptions(options)

  const formattedDefaultValue =
    typeof defaultValue !== 'object'
      ? getSelectOption(formattedOptions, defaultValue)
      : defaultValue

  const currentValue = getSelectOption(formattedOptions, value) || null

  return (
    <Label htmlFor={name} description={label} className="block w-full">
      <>
        <ClientOnly
          fallback={
            <select
              id={name}
              name={name}
              defaultValue={defaultValue || undefined}
              className={clsx(
                'flex min-h-[50px] w-full items-center rounded-[15px] border border-gray-300 bg-white p-3 text-sm leading-6 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400',
                fieldError &&
                  'border-red-500 text-red-600 hover:border-red-500 focus:ring-red-500',
                (disabled || state !== 'idle') &&
                  'pointer-events-auto cursor-not-allowed bg-gray-200'
              )}
            >
              {formattedOptions?.map((opt) => (
                <option
                  key={typeof opt === 'object' ? getSelectValue(opt) : opt}
                  value={typeof opt === 'object' ? getSelectValue(opt) : opt}
                >
                  {opt.name}
                </option>
              ))}
            </select>
          }
        >
          {() => (
            <>
              <input
                type="hidden"
                value={value || ''} // The value should always be defined, even as an empty string instead of undefined
                name={name}
              />
              <ReactSelect<TReactSelectOption, false>
                id={name}
                aria-labelledby={name}
                instanceId={name}
                styles={styles}
                defaultValue={formattedDefaultValue}
                options={formattedOptions}
                placeholder={placeholder}
                isClearable={isClearable}
                isDisabled={disabled || state !== 'idle'}
                getOptionValue={(option: TReactSelectOption) =>
                  `${getSelectValue(option)}`
                }
                getOptionLabel={(option: TReactSelectOption) =>
                  `${option.name}`
                }
                value={currentValue}
                onBlur={validate}
                onInputChange={onInputChange}
                onChange={(newValue) => {
                  setValue(getSelectValue(newValue))
                  validate()
                  onSelectChange?.(getSelectValue(newValue))
                }}
                noOptionsMessage={() =>
                  noOptionsText || 'No hay opciones disponibles'
                }
              />
            </>
          )}
        </ClientOnly>
      </>

      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
