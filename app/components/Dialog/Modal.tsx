import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useNavigate, Link } from '@remix-run/react'
import { ClientOnly } from 'remix-utils'

import type { PropsWithChildren } from 'react'

interface ModalProps extends PropsWithChildren {
  onCloseRedirectTo: string
}

export function Modal({ onCloseRedirectTo, children }: ModalProps) {
  const navigate = useNavigate()

  return (
    <ClientOnly
      fallback={
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen flex-col">
            <Link
              to={onCloseRedirectTo}
              className="fixed inset-0 w-full bg-gray-900 bg-opacity-70 text-transparent"
            >
              Regresar
            </Link>
            {children}
          </div>
        </div>
      }
    >
      {() => (
        <Transition show as={Fragment}>
          <Dialog
            open
            onClose={() => {
              navigate(onCloseRedirectTo)
            }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-screen flex-col">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-900 bg-opacity-70" />
              </Transition.Child>

              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="flex min-h-screen w-full flex-col">
                  {children}
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </ClientOnly>
  )
}
