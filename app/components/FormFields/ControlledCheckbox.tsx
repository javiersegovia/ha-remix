import type { ReactNode } from 'react'
import { checkboxInputStyle } from './Checkbox'

interface ControlledCheckboxProps {
  name: string
  label?: string | ReactNode
  checked: boolean
  onChange: (newValue: boolean) => void
  value?: string
}

export const ControlledCheckbox = ({
  name,
  label,
  value,
  checked,
  onChange,
}: ControlledCheckboxProps) => {
  return (
    <div className="flex gap-2">
      <div>
        <input
          id={name}
          name={name}
          type="checkbox"
          value={value}
          checked={checked || false}
          onChange={(e) => onChange(e.target.checked)}
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
