import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import { Link, useNavigate } from '@remix-run/react'
import { HiMiniXMark, HiOutlinePencilSquare } from 'react-icons/hi2'
import React from 'react'
import { Title } from '../Typography/Title'

interface AnimatedRightPanelProps {
  children?: ReactNode
  onCloseRedirectTo: string
  onEditRedirectTo?: string
  actions?: React.ReactNode
  title?: string
}

export const AnimatedRightPanel = ({
  children,
  onEditRedirectTo,
  onCloseRedirectTo,
  title,
  actions,
}: AnimatedRightPanelProps) => {
  const navigate = useNavigate()
  const onClose = () =>
    navigate(onCloseRedirectTo, {
      preventScrollReset: true,
      replace: true,
    })

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-0 left-0 right-0 top-0 z-20 flex"
      >
        <div
          onClick={onClose}
          className="fixed bottom-0 left-0 right-0 top-0 min-h-screen w-full bg-white/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: '30%' }}
          animate={{ x: 0 }}
          exit={{ x: '60%' }}
          transition={{ duration: 0.2 }}
          className="ml-auto flex h-full max-h-screen w-full max-w-xl flex-col border border-gray-200 bg-white py-6"
        >
          <section className="flex items-center justify-end gap-4 px-6">
            {title && (
              <Title className="font-semibold text-gray-900" as="h2">
                {title}
              </Title>
            )}

            <div className="ml-auto" />

            {onEditRedirectTo && (
              <Link
                to={onEditRedirectTo}
                className="flex gap-3 rounded-full border border-gray-200 p-2 text-gray-600"
              >
                <HiOutlinePencilSquare className="text-2xl" />
              </Link>
            )}

            <Link
              to={onCloseRedirectTo}
              className="flex gap-3 rounded-full border border-gray-200 p-2 text-gray-600"
              preventScrollReset
            >
              <HiMiniXMark className="text-2xl" />
            </Link>
          </section>

          <section className="mx-3 my-6 flex-grow overflow-y-auto px-3">
            {children}
          </section>

          {actions && (
            <section className="mt-auto px-6 pt-6">{actions}</section>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
