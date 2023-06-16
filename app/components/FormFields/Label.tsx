import clsx from 'clsx'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ILabelProps {
  htmlFor: string
  required?: boolean
  description?: string
  className?: string
  children?: React.ReactNode
}

export const labelStyles =
  'mb-1 ml-3 block text-xs font-medium text-steelBlue-700' as const

export const Label = ({
  htmlFor = '',
  className = '',
  required = false,
  description,
  children,
  ...otherProps
}: ILabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(clsx('block', className))}
      {...otherProps}
    >
      {description && (
        <p className={labelStyles}>
          {description} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      {children}
    </label>
  )
}
