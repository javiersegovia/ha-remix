import React from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export const Container = ({ className, children }: ContainerProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'mx-auto max-w-screen-lg p-3 lg:px-10 xl:max-w-screen-xl',
          className
        )
      )}
    >
      {children}
    </div>
  )
}
