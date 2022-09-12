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
  onSelectChange?: (newValue?: readonly TReactSelectOption[] | null) => void
}

export const SelectMultiple = ({
  name,
  label,
  placeholder,
  options,
  error,
  disabled,
  onSelectChange,
}: SelectProps) => {
  const isHydrated = useHydrated()
  const { error: formError, defaultValue = [], validate } = useField(name)
  const [value, setValue] = useControlField<readonly TReactSelectOption[]>(name)

  const isSubmitting = useIsSubmitting()
  const fieldError: string | undefined = error || formError
  const styles = selectStyles<true>(!!fieldError)

  const formattedDefaultValues =
    options?.filter((opt) => defaultValue.includes(getSelectValue(opt))) || []

  return (
    <Label htmlFor={name} description={label}>
      <>
        {value?.map((val, i) => {
          return (
            <input
              type="hidden"
              name={`${name}[${i}]`}
              key={typeof val === 'object' ? getSelectValue(val) : val}
              value={typeof val === 'object' ? getSelectValue(val) : val}
            />
          )
        })}

        <ReactSelect<TReactSelectOption, true>
          aria-labelledby={name}
          isMulti
          id={name}
          instanceId={name}
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
