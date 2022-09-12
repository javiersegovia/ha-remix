import clsx from 'clsx'
import type { ReactNode } from 'react'
import {
  useControlField,
  useField,
  useIsSubmitting,
} from 'remix-validated-form'

interface CheckboxProps {
  name: string
  label?: string | ReactNode
}

const checkboxInputStyle = clsx(
  'accent-steelBlue-600 mr-2 w-4 h-4 bg-white bg-contain bg-center duration-200',
  'bg-no-repeat border checked:border-blue-600 border-gray-200 rounded-sm focus:outline-none cursor-pointer transition'
)

// const labelInputStyle =
//   'text-steelBlue-600 inline-block w-auto text-sm font-medium'

export const Checkbox = ({ name, label }: CheckboxProps) => {
  const { validate } = useField(name)
  const [value, setValue] = useControlField<boolean | undefined>(name)
  const isSubmitting = useIsSubmitting()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.checked)
    validate()
  }

  return (
    <div className="flex gap-2">
      <div>
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={value || false}
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
