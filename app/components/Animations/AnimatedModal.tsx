import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import { useNavigate } from '@remix-run/react'
import { Card } from '../Cards/Card'
import clsx from 'clsx'

interface AnimatedModalProps {
  children?: ReactNode
  onCloseRedirectTo: string
  actions?: React.ReactNode
  overrideContainer?: boolean
}

export const AnimatedModal = ({
  children,
  onCloseRedirectTo,
  actions,
  overrideContainer = false,
}: AnimatedModalProps) => {
  const navigate = useNavigate()
  const onClose = () =>
    navigate(onCloseRedirectTo, {
      preventScrollReset: true,
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
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="flex h-full w-full"
        >
          {overrideContainer ? (
            <>
              {children}
              {actions}
            </>
          ) : (
            <Card className="m-auto w-full max-w-lg px-0">
              <section
                className={clsx('mx-3 max-h-[30rem] overflow-y-auto px-3')}
              >
                {children}
              </section>

              {actions && <section className="px-6 pt-6">{actions}</section>}
            </Card>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
