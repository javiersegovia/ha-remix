import clsx from 'clsx'
import React from 'react'

interface ILabelProps {
  htmlFor: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export const Label = ({
  htmlFor = '',
  className = '',
  description,
  children,
  ...otherProps
}: ILabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx('block', className)}
      {...otherProps}
    >
      {description && (
        <span className="mb-1 block text-xs font-medium text-steelBlue-600">
          {description}
        </span>
      )}
      {children}
    </label>
  )
}
