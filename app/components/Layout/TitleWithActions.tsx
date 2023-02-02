import clsx from 'clsx'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Title } from '../Typography/Title'

interface TitleWithActionsProps {
  title: string
  actions: React.ReactNode
  className?: string
}

export const TitleWithActions = ({
  title,
  actions,
  className,
}: TitleWithActionsProps) => {
  return (
    <div
      className={twMerge(
        clsx('flex flex-col items-center lg:flex-row lg:justify-between'),
        className
      )}
    >
      <Title>{title}</Title>
      <div className="mt-4 flex w-full items-center justify-center gap-4 md:w-auto lg:mt-0">
        {actions}
      </div>
    </div>
  )
}
