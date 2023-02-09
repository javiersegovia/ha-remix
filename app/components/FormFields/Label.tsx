import clsx from 'clsx'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ILabelProps {
  htmlFor: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export const labelStyles =
  'mb-1 block text-xs font-medium text-steelBlue-600' as const

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
      className={twMerge(clsx('block', className))}
      {...otherProps}
    >
      {description && <span className={labelStyles}>{description}</span>}
      {children}
    </label>
  )
}
