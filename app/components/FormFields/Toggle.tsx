import clsx from 'clsx'
import {
  useControlField,
  useField,
  useIsSubmitting,
} from 'remix-validated-form'

interface ToggleProps {
  name: string
  label: string
}

export const Toggle = ({ name, label }: ToggleProps) => {
  const { validate, defaultValue } = useField(name)
  const [value, setValue] = useControlField<boolean>(name)
  const isSubmitting = useIsSubmitting()

  return (
    <div className="flex h-full w-full items-center">
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          id={name}
          name={name}
          defaultValue={defaultValue}
          checked={value}
          value="true"
          type="checkbox"
          className={clsx(
            'peer sr-only',
            isSubmitting &&
              'cursor-not-allowed focus:border-transparent focus:ring-0'
          )}
          onChange={(e) => {
            validate()
            setValue(e.target.checked)
          }}
        />
        <div className="peer h-9 w-[64px] rounded-full bg-gray-300 after:absolute after:top-1 after:left-[3px] after:h-7 after:w-7 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-steelBlue-400 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-400" />

        <span className="ml-3 text-sm font-medium text-steelBlue-700">
          {label}
        </span>
      </label>
    </div>
  )
}
