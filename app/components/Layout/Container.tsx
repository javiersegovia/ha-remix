import React from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: ContainerSize
}

export enum ContainerSize {
  LG = 'LG',
  XL = 'XL',
}

export const Container = ({
  className,
  children,
  size = ContainerSize.XL,
}: ContainerProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'mx-auto max-w-screen-lg p-3 lg:px-10',

          size === ContainerSize.XL && 'xl:max-w-screen-xl',
          className
        )
      )}
    >
      {children}
    </div>
  )
}
