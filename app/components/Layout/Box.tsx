import type { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

interface BoxProps extends PropsWithChildren {
  className?: string
}

export const Box = ({ children, className, ...otherProps }: BoxProps) => {
  return (
    <div
      className={twMerge('relative rounded-xl bg-white shadow-xl', className)}
      {...otherProps}
    >
      {children}
    </div>
  )
}
