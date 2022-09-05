import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

interface FormGridItemProps extends PropsWithChildren {
  className?: string
}

export const FormGridItem = ({ className, children }: FormGridItemProps) => {
  return (
    <div className={clsx('col-span-12 lg:col-span-6', className)}>
      {children}
    </div>
  )
}
