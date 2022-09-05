import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

interface BoxProps extends PropsWithChildren {
  className?: string
}

export const Box = ({ children, className, ...otherProps }: BoxProps) => {
  return (
    <div
      className={clsx('relative rounded-[15px] bg-white shadow', className)}
      {...otherProps}
    >
      {children}
    </div>
  )
}
