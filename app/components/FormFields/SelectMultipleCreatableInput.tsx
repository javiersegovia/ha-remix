import type { KeyboardEventHandler } from 'react'

import React from 'react'
import CreatableSelect from 'react-select/creatable'
import { useHydrated } from 'remix-utils'
import { useField } from 'remix-validated-form'

import { ErrorMessage } from './ErrorMessage'
import { Label } from './Label'
import { selectStyles } from './Select.styles'
import type { TReactSelectOption } from './Select'
import { getSelectValue } from './Select'
import { useNavigation } from '@remix-run/react'

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
  currentValues: TReactSelectOption[] | null | undefined
  onSelectChange?: (newValue?: readonly TReactSelectOption[] | null) => void
}

export const SelectMultipleCreatableInput = ({
  name,
  label,
  placeholder,
  currentValues,
  error,
  disabled,
  onSelectChange,
}: SelectProps) => {
  const isHydrated = useHydrated()
  const { error: formError, validate } = useField(name)

  const { state } = useNavigation()

  const fieldError: string | undefined = error || formError
  const styles = selectStyles<true>(!!fieldError)

  const formattedDefaultValues =
    currentValues?.map((currentValue) => ({
      id: currentValue.name,
      name: currentValue.name,
    })) || []

  const [inputValue, setInputValue] = React.useState('')
  const [fieldValue, setFieldValue] = React.useState<
    readonly TReactSelectOption[]
  >(formattedDefaultValues)

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        const hasInputValue = fieldValue.find(
          (val) => val.name.toLowerCase() === inputValue.toLowerCase()
        )

        if (!hasInputValue) {
          setFieldValue((prev) => [
            ...prev,
            { name: inputValue, value: inputValue },
          ])
        }

        setInputValue('')
        event.preventDefault()
    }
  }

  return (
    <Label htmlFor={name} description={label}>
      <>
        {fieldValue?.map((val, i) => {
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

        <CreatableSelect<TReactSelectOption, true>
          components={{
            DropdownIndicator: null,
          }}
          inputValue={inputValue}
          id={name}
          instanceId={name}
          aria-labelledby={name}
          isClearable
          isMulti
          styles={styles}
          menuIsOpen={false}
          isDisabled={disabled || state !== 'idle' || !isHydrated}
          getOptionValue={(option: TReactSelectOption) =>
            `${getSelectValue(option)}`
          }
          getOptionLabel={(option: TReactSelectOption) => `${option.name}`}
          onChange={(newValue) => {
            setFieldValue(newValue)
            validate()
          }}
          onInputChange={(newValue) => setInputValue(newValue)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={fieldValue}
          defaultValue={formattedDefaultValues}
        />
      </>
      <ErrorMessage>{fieldError}</ErrorMessage>
    </Label>
  )
}
