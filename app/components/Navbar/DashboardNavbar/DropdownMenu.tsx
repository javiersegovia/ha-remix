import React from 'react'
import { Form as RemixForm, Link } from '@remix-run/react'
import { Menu, Transition } from '@headlessui/react'
import { HiOutlineMenu } from 'react-icons/hi'
import type { AdminUser, User } from '@prisma/client'
import clsx from 'clsx'

interface DropdownMenuProps {
  user: Pick<User, 'firstName' | 'email'> | Pick<AdminUser, 'email'>
  isAdmin: boolean
}

export const DropdownMenu = ({ user, isAdmin = false }: DropdownMenuProps) => {
  return (
    <>
      <div className="relative z-20 inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button as={React.Fragment}>
                <button
                  type="button"
                  className="flex h-full items-center text-3xl text-gray-700 hover:text-cyan-600"
                >
                  <HiOutlineMenu />
                </button>
              </Menu.Button>

              <Transition
                show={open}
                enter="transition ease-out duration-80"
                enterFrom="transform opacity-0 scale-95 z-20"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-65"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  className="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg outline-none"
                >
                  <div className="px-4 py-3">
                    {'firstName' in user && user.firstName ? (
                      <span className="block w-full text-center text-sm font-medium text-gray-700">
                        {`Hola, ${user.firstName}!`}
                      </span>
                    ) : (
                      <>
                        <p className="truncate text-sm font-medium leading-5 text-gray-900">
                          {user.email}
                        </p>
                      </>
                    )}
                  </div>

                  {!isAdmin && (
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={'/dashboard/account'}
                            className={clsx(
                              'flex w-full justify-between px-4 py-2 text-center text-sm leading-5 hover:bg-gray-100 hover:text-gray-900',
                              active
                                ? `bg-gray-100 text-gray-900`
                                : `text-gray-700`
                            )}
                          >
                            Mi cuenta
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  )}

                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <RemixForm action="/logout" method="post">
                          <button
                            type="submit"
                            className={clsx(
                              'flex w-full justify-between px-4 py-2 text-center text-sm leading-5 hover:bg-gray-100 hover:text-gray-900',
                              active
                                ? `bg-gray-100 text-gray-900`
                                : `text-gray-700`
                            )}
                          >
                            Cerrar sesión
                          </button>
                        </RemixForm>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </>
  )
}
