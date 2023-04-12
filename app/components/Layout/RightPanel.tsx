import React from 'react'
import { Link } from '@remix-run/react'
import { RiCloseFill } from 'react-icons/ri'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { Box } from './Box'

interface RightPanelProps {
  children: React.ReactNode
  onCloseRedirectTo: string
  onEditRedirectTo?: string
}

export const RightPanel = ({
  children,
  onCloseRedirectTo,
  onEditRedirectTo,
}: RightPanelProps) => {
  return (
    <div className="mt-auto h-full w-full md:ml-auto md:max-w-lg">
      <Box className="mt-auto flex w-full flex-col space-y-5 rounded-none p-5 md:min-h-screen md:w-auto">
        <div className="ml-auto flex items-center justify-end gap-4">
          {onEditRedirectTo && (
            <Link
              to={onEditRedirectTo}
              className="ml-auto flex gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
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
