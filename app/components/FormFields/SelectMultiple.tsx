import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import ReactSelect from 'react-select'
import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { selectStyles } from './Select.styles'

export type TSelectOption =
  | {
      id: string | number
      name: string
    }
  | {
      value: string | number
      name: string
    }

export type TSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>

interface SelectProps extends TSelectProps {
  name: string
  label?: string
  placeholder?: string
  error?: string
  options: TSelectOption[] | null | undefined
  defaultSelectValue?: TSelectOption
}

export const SelectMultiple = ({
  name,
  label,
  placeholder,
  options,
  error,
  defaultSelectValue,
}: SelectProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const fieldError: string | undefined =
    error || (errors?.[name]?.message as string)

  const styles = selectStyles<true>(!!fieldError)

  return (
    <Label htmlFor={name} description={label}>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, value, onChange } }) => (
          <ReactSelect<TSelectOption, true>
            ref={ref}
            aria-labelledby={name}
            isMulti
            id={name}
            instanceId={name}
            styles={styles}
            options={options || []}
            placeholder={placeholder}
            defaultValue={
              typeof defaultSelectValue === 'string'
                ? {
                    id: defaultSelectValue,
                    name: defaultSelectValue,
                  }
                : defaultSelectValue
            }
            getOptionValue={(option: TSelectOption) =>
              `${
                ('id' in option && option.id) ||
                ('value' in option && option.value)
              }`
            }
            getOptionLabel={(option: TSelectOption) => `${option.name}`}
            value={value}
            onChange={(newValue) => {
              onChange(newValue)
            }}
          />
        )}
      />
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
