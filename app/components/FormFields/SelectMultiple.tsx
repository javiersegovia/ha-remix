import React from 'react'
import ReactSelect from 'react-select'
import {
  useControlField,
  useField,
  useIsSubmitting,
} from 'remix-validated-form'

import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { selectStyles } from './Select.styles'
import type { TReactSelectOption } from './Select'
import { getSelectValue } from './Select'
import { useHydrated } from 'remix-utils'
import makeAnimated from 'react-select/animated'

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
  error?: string
  options: TReactSelectOption[] | null | undefined
  defaultValue?: TReactSelectOption[] | undefined
  onSelectChange?: (newValue?: readonly TReactSelectOption[] | null) => void
}

const animatedComponents = makeAnimated()

export const SelectMultiple = ({
  name,
  label,
  placeholder,
  options,
  error,
  disabled,
  defaultValue,
  onSelectChange,
}: SelectProps) => {
  const isHydrated = useHydrated()
  const {
    error: formError,
    defaultValue: formDefaultValue = [],
    validate,
  } = useField(name)
  const [value, setValue] = useControlField<readonly TReactSelectOption[]>(name)

  const isSubmitting = useIsSubmitting()
  const fieldError: string | undefined = error || formError
  const styles = selectStyles<true>(!!fieldError)

  // Determine the default value to display in the select based on the form default value and the prop default value
  // This is needed because in some cases, the formDefaultValue is not present, while the prop defaultValue is.
  const formattedDefaultValues =
    (formDefaultValue?.length > 0
      ? options?.filter((opt) => formDefaultValue.includes(getSelectValue(opt)))
      : defaultValue) || []

  return (
    <Label htmlFor={name} description={label}>
      <>
        {value?.map((val, i) => {
          return (
            <input
              type="hidden"
              name={`${name}[${i}]`}
              key={typeof val === 'object' ? getSelectValue(val) : val}
              value={
                (typeof val === 'object' ? getSelectValue(val) : val) || ''
              }
            />
          )
        })}

        <ReactSelect<TReactSelectOption, true>
          aria-labelledby={name}
          isMulti
          id={name}
          instanceId={name}
          components={animatedComponents}
          styles={styles}
          options={options || []}
          placeholder={placeholder}
          defaultValue={formattedDefaultValues}
          isDisabled={disabled || isSubmitting || !isHydrated}
          getOptionValue={(option: TReactSelectOption) =>
            `${getSelectValue(option)}`
          }
          getOptionLabel={(option: TReactSelectOption) => `${option.name}`}
          onChange={(newValues) => {
            setValue(newValues)
            validate()
            onSelectChange?.(newValues)
          }}
        />
      </>
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
