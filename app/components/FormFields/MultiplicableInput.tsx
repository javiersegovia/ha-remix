import React, { useState } from 'react'
import type { TInputProps } from './Input'

import { Input } from './Input'
import { useControlField } from 'remix-validated-form'
import { Button, ButtonColorVariants } from '../Button'
import { RiAddFill, RiSubtractFill } from 'react-icons/ri'

interface MultiplicableInputProps {
  inputProps: Omit<TInputProps, 'name' | 'type'>
  name: string
  label?: string
}

export const MultiplicableInput = ({
  inputProps,
  name,
  label,
}: MultiplicableInputProps) => {
  const [value] = useControlField<string[]>(name)
  const [inputCount, setInputCount] = useState(value?.length - 1 || 0)

  const addInput = () => setInputCount((prev) => ++prev)
  const removeInput = () => setInputCount((prev) => --prev)

  return (
    <>
      <div className="w-ful flex flex-col">
        <Input name={`${name}[0]`} type="text" label={label} {...inputProps} />

        {inputCount > 0 && (
          <>
            {Array.from(Array(inputCount)).map((_, index) => (
              <Input
                name={`${name}[${index + 1}]`}
                key={`${name}[${index + 1}]`}
                type="text"
                className="mt-4"
                {...inputProps}
              />
            ))}
          </>
        )}

        <section className="ml-auto inline-flex gap-3">
          <Button
            type="button"
            onClick={addInput}
            className="flex gap-3 rounded-full p-2 text-white"
            variant={ButtonColorVariants.ALTERNATIVE}
          >
            <RiAddFill className="text-2xl" />
          </Button>

          {inputCount > 0 && (
            <Button
              type="button"
              onClick={removeInput}
              className="flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800 hover:bg-steelBlue-200"
            >
              <RiSubtractFill className="text-2xl" />
            </Button>
          )}
        </section>
      </div>
    </>
  )
}
