import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from '@remix-run/react'
import { $path } from 'remix-routes'
import { Dialog, Menu, Transition } from '@headlessui/react'

import {
  HiOutlineTrophy,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiMiniBars3BottomRight,
  HiMiniXMark,
  HiArrowLeftOnRectangle,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2'
import clsx from 'clsx'
import { Button } from '../Button'

const navigation = [
  { name: 'Retos', href: $path('/home'), Icon: HiOutlineClipboardDocumentList },
  { name: 'Personas', href: $path('/people'), Icon: HiOutlineUserGroup },
  { name: 'Logros', href: $path('/achievements'), Icon: HiOutlineTrophy },
]

const menuNavigation = [
  {
    name: 'Cerrar sesión',
    href: $path('/logout'),
    Icon: HiArrowLeftOnRectangle,
  },
]

interface NavbarProps {
  avatar: {
    imgSrc?: string
    initials: string
  }
  permissions: {
    canManageCompany: boolean
  }
}

export const Navbar = ({ avatar, permissions }: NavbarProps) => {
  const { canManageCompany } = permissions

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <div className="pt-[88px]" />
      <header
        className="fixed left-0 right-0 top-0 z-10 bg-white"
        key={pathname}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link to={$path('/home')} className="-m-1.5 h-full max-h-10">
              <span className="sr-only">Ümany</span>
              <img
                className="w-auto"
                src="/images/logos/logo_umany_single_u.png"
                alt="Logo Ümany"
              />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <HiMiniBars3BottomRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map(({ name, href, Icon }) => (
              <NavLink
                key={name}
                to={href}
                className={({ isActive }) =>
                  clsx(
                    'rounded-3xl px-5 py-2 text-sm font-semibold leading-6 text-gray-600',
                    isActive && 'bg-gray-100 text-green-600'
                  )
                }
              >
                <span className="hidden lg:block">{name}</span>
                <Icon className="text-2xl lg:hidden" />
              </NavLink>
            ))}
          </div>
          <div className="hidden items-center gap-6 lg:flex lg:flex-1 lg:justify-end">
            {pathname.includes('/home') && (
              <Button
                href="/home/create-challenge"
                className="ml-auto w-auto"
                size="XS"
              >
                Crear reto
              </Button>
            )}

            <Menu as="div" className="relative">
              <Menu.Button>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-500">
                  <span className="text-sm font-medium uppercase leading-none text-white">
                    {avatar.initials}
                  </span>
                </span>
              </Menu.Button>

              <Transition
                enter="transition duration-200 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-100 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        className={clsx(
                          'flex items-center gap-3 rounded-md p-1 text-sm',
                          active && 'bg-gray-100 text-green-600'
                        )}
                        to={$path('/company-settings')}
                      >
                        <HiOutlineBuildingOffice2 className="text-2xl" />
                        Configuración
                      </Link>
                    )}
                  </Menu.Item>

                  {menuNavigation.map(({ href, name, Icon }) => (
                    <Menu.Item key={href}>
                      {({ active }) => (
                        <Link
                          className={clsx(
                            'flex items-center gap-3 rounded-md p-1 text-sm',
                            active && 'bg-gray-100 text-green-600'
                          )}
                          to={href}
                        >
                          <Icon className="text-2xl" />
                          {name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </nav>

        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-10" />

          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex">
              <button
                type="button"
                className="-m-2.5 ml-auto rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <HiMiniXMark className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a href={item.href} key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          clsx(
                            '-mx-3 block rounded-3xl px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50',
                            isActive && 'bg-gray-100 text-green-600'
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    </a>
                  ))}
                </div>

                <div className="py-6">
                  {canManageCompany && (
                    <Link
                      to={$path('/company-settings')}
                      className="-mx-3 block rounded-3xl px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Configuración
                    </Link>
                  )}

                  <Link
                    to={$path('/logout')}
                    className="-mx-3 block rounded-3xl px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Cerrar sesión
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </>
  )
}
