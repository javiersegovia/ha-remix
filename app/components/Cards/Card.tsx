import type { ReactNode } from 'react'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children?: ReactNode
  className?: string
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-3xl border border-gray-300 bg-white p-6',
          className
        )
      )}
    >
      {children}
    </div>
  )
}
