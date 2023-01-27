import React from 'react'
import { Link } from '@remix-run/react'
import { RiCloseFill } from 'react-icons/ri'
import { Box } from './Box'

interface RightPanelProps {
  children: React.ReactNode
  onCloseRedirectTo: string
}

export const RightPanel = ({
  children,
  onCloseRedirectTo,
}: RightPanelProps) => {
  return (
    <div className="mt-auto h-full w-full md:ml-auto md:max-w-lg">
      <Box className="mt-auto flex w-full flex-col space-y-5 rounded-none p-5 md:min-h-screen md:w-auto">
        <Link
          to={onCloseRedirectTo}
          className="ml-auto flex gap-3 text-steelBlue-400"
        >
          <RiCloseFill className="text-2xl" />
          <span className="tracking-widest">Cerrar</span>
        </Link>

        {children}
      </Box>
    </div>
  )
}
