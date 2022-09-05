import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

interface FormGridWrapperProps extends PropsWithChildren {
  className?: string
}

export const FormGridWrapper = ({
  className,
  children,
}: FormGridWrapperProps) => {
  return (
    <section className={clsx('grid grid-cols-12 gap-5', className)}>
      {children}
    </section>
  )
}
