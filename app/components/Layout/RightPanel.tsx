import React from 'react'
import { Link } from '@remix-run/react'
import { RiCloseFill } from 'react-icons/ri'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { Box } from './Box'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Title } from '../Typography/Title'

interface RightPanelProps {
  children: React.ReactNode
  onCloseRedirectTo: string
  onEditRedirectTo?: string
  className?: string
  title?: string
}

export const RightPanel = ({
  children,
  onCloseRedirectTo,
  onEditRedirectTo,
  className,
  title,
}: RightPanelProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'mt-auto h-full w-full md:ml-auto md:min-h-screen md:max-w-lg',
          className
        )
      )}
    >
      <Box className="mt-auto flex w-full flex-col space-y-5 rounded-none p-5 md:max-h-screen md:min-h-screen md:w-auto">
        <div className="flex items-center justify-end gap-4">
          {title && <Title className="text-steelBlue-600 font-bold" as="h3">{title}</Title>}

          <div className="ml-auto" />

          {onEditRedirectTo && (
            <Link
              to={onEditRedirectTo}
              className="flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
            >
              <MdOutlineModeEditOutline className="text-2xl" />
            </Link>
          )}

          <Link
            to={onCloseRedirectTo}
            className="flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
          >
            <RiCloseFill className="text-2xl" />
          </Link>
        </div>

        {children}
      </Box>
    </div>
  )
}
