import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import ReactSelect from 'react-select'
import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { selectStyles } from './Select.styles'

export type TReactSelectOption =
  | {
      id: string | number
      name: string
    }
  | {
      value: string | number
      name: string
    }

export type TSelectOption = TReactSelectOption | string

export type TSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>

interface SelectProps extends TSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: TSelectOption[] | null | undefined
  error?: string
  isClearable?: boolean
  noOptionsText?: string
  defaultSelectValue?: TSelectOption
  onSelectChange?: (newValue?: TSelectOption | null) => void
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

export const Select = ({
  name,
  label,
  placeholder,
  options = [],
  error,
  isClearable = false,
  disabled,
  defaultSelectValue,
  noOptionsText,
  onSelectChange,
}: SelectProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const fieldError: string | undefined =
    error || (errors?.[name]?.message as string)

  const styles = selectStyles<false>(!!fieldError)

  const formattedOptions = formatOptions(options)

  return (
    <Label htmlFor={name} description={label} className="block w-full">
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, value, onChange } }) => (
          <ReactSelect<TReactSelectOption, false>
            ref={ref}
            aria-labelledby={name}
            id={name}
            instanceId={name}
            styles={styles}
            className="react-select-container"
            defaultValue={
              typeof defaultSelectValue === 'string'
                ? {
                    id: defaultSelectValue,
                    name: defaultSelectValue,
                  }
                : defaultSelectValue
            }
            classNamePrefix="react-select"
            options={formattedOptions}
            placeholder={placeholder}
            isClearable={isClearable}
            isDisabled={disabled}
            getOptionValue={(option: TReactSelectOption) =>
              `${
                ('id' in option && option.id) ||
                ('value' in option && option.value)
              }`
            }
            getOptionLabel={(option: TReactSelectOption) => `${option.name}`}
            value={value}
            onChange={(newValue) => {
              onChange(newValue)
              onSelectChange?.(newValue)
            }}
            noOptionsMessage={() =>
              noOptionsText || 'No hay opciones disponibles'
            }
          />
        )}
      />
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
