import type { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

interface FormGridItemProps extends PropsWithChildren {
  className?: string
}

export const FormGridItem = ({ className, children }: FormGridItemProps) => {
  return (
    <div className={twMerge('col-span-12 lg:col-span-6', className)}>
      {children}
    </div>
  )
}
