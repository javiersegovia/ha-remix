import type { ColorResult } from 'react-color'

import { CirclePicker } from 'react-color'
import { Label } from './Label'
import { useControlField } from 'remix-validated-form'

interface ColorPickerProps {
  name: string
  label: string
}
export const ColorPicker = ({ name, label }: ColorPickerProps) => {
  const [currentColor, setCurrentColor] = useControlField<string>(name)

  const handleOnChange = (color: ColorResult) => {
    setCurrentColor(color.hex)
  }

  return (
    <>
      <Label htmlFor={name} description={label}>
        <div className="mt-4 flex">
          <div
            className="mr-5 inline-flex w-2/5 items-stretch gap-4 rounded-3xl border border-gray-200"
            style={{ backgroundColor: currentColor }}
          />
          <input type="hidden" name={name} id={name} value={currentColor} />

          <CirclePicker
            color={currentColor}
            onChangeComplete={handleOnChange}
          />
        </div>
      </Label>
    </>
  )
}
