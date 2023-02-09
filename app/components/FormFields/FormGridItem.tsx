import type { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

interface FormGridItemProps extends PropsWithChildren {
  className?: string
  isFullWidth?: boolean
}

export const FormGridItem = ({
  className,
  isFullWidth,
  children,
}: FormGridItemProps) => {
  return (
    <div
      className={twMerge(
        'col-span-12 lg:col-span-6',
        isFullWidth && 'lg:col-span-12',
        className
      )}
    >
      {children}
    </div>
  )
}
