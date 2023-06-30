import React from 'react'
import { Box } from './Box'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Title } from '../Typography/Title'

interface CenterPanelProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export const CenterPanel = ({
  children,
  className,
  title,
}: CenterPanelProps) => {
  return (
    <div
      className={twMerge(
        clsx('m-auto flex items-center justify-center', className)
      )}
    >
      <Box className="flex h-auto min-h-min flex-col space-y-4 rounded-xl p-8 md:w-full md:min-w-min">
        <div className="flex items-center justify-end gap-4">
          {title && <Title className="mr-1/4 flex justify-end">{title}</Title>}

          <div className="ml-auto" />
        </div>
        {children}
      </Box>
    </div>
  )
}
