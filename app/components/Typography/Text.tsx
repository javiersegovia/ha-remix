import clsx from 'clsx'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface TextProps {
  children?: ReactNode
  className?: string
}

export const Text = ({ className, children }: TextProps) => {
  return <p className={twMerge(clsx('text-gray-500', className))}>{children}</p>
}
