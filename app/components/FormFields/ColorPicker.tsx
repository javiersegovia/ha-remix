import type { ColorResult } from 'react-color'

import { SketchPicker } from 'react-color'
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
        <div className="ml-3 mt-4">
          <SketchPicker
            color={currentColor}
            onChangeComplete={handleOnChange}
          />

          <input type="hidden" name={name} id={name} value={currentColor} />
        </div>
      </Label>
    </>
  )
}
