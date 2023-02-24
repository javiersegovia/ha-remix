import type { ReactNode } from 'react'

import clsx from 'clsx'
import { useField, useIsSubmitting } from 'remix-validated-form'

interface CheckboxProps {
  name: string
  value: string
  label?: string | ReactNode
}

const checkboxInputStyle = clsx(
  'accent-steelBlue-600 mr-2 w-4 h-4 bg-white bg-contain bg-center duration-200',
  'bg-no-repeat border checked:border-blue-600 border-gray-200 rounded-sm focus:outline-none cursor-pointer transition'
)

export const RepeteableCheckbox = ({ name, label, value }: CheckboxProps) => {
  const { validate, getInputProps } = useField(name)
  const isSubmitting = useIsSubmitting()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validate()
  }

  return (
    <div className="flex gap-2">
      <div>
        <input
          id={name}
          name={name}
          {...getInputProps({ type: 'checkbox', value })}
          onChange={handleChange}
          readOnly={isSubmitting}
          className={checkboxInputStyle}
        />
      </div>

      {label && (
        <label
          className="inline-block w-auto cursor-pointer text-sm font-medium text-steelBlue-600"
          htmlFor={name}
        >
          {label}
        </label>
      )}
    </div>
  )
}
