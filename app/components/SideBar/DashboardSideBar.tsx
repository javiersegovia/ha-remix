import type { PropsWithChildren } from 'react'
import { useRef, useState } from 'react'
import { Transition } from '@headlessui/react'
import type { IconType } from 'react-icons'
import { HiLogout } from 'react-icons/hi'

import { useOnClickOutside } from '~/hooks/useOnClickOutside'
import { NavDropdownItem } from './NavDropdownItem'
import { Form as RemixForm, Link } from '@remix-run/react'
import clsx from 'clsx'

import { DashboardNavbar } from '~/components/Navbar/DashboardNavbar'
import { NavItem } from './NavItem'
import type { AdminUser, User } from '@prisma/client'

export type INavPath =
  | {
      icon: IconType
      path: string
      title: string
      subPaths?: never
    }
  | {
      icon: IconType
      path?: never
      title: string
      subPaths: { title: string; path: string }[]
    }

export type DashboardColorVariant = 'PRIMARY' | 'DARK'

interface DashboardSideBarProps {
  user: Pick<User, 'firstName' | 'email'> | Pick<AdminUser, 'email'>
  paths: INavPath[]
  logoHref: string
  isAdmin?: boolean
  variant?: DashboardColorVariant
}

export const DashboardSideBar = ({
  children,
  variant = 'PRIMARY',
  logoHref,
  paths,
  user,
  isAdmin = false,
}: PropsWithChildren<DashboardSideBarProps>) => {
  const [showSideBar, setShowSideBar] = useState(false)

  const navRef = useRef(null)
  useOnClickOutside(navRef, () => setShowSideBar(false))

  return (
    <>
      <section
        className={clsx(
          'flex min-h-screen flex-col bg-steelBlue-900',
          variant === 'DARK' && 'bg-gray-900'
        )}
      >
        <nav
          ref={navRef}
          className={clsx(
            'fixed left-0 top-0 z-20 h-full w-60 origin-left transform overflow-y-auto overflow-x-hidden bg-steelBlue-900 pb-10 transition md:translate-x-0',
            showSideBar ? 'translate-x-0' : '-translate-x-full',
            variant === 'DARK' && 'bg-gray-900'
          )}
        >
          <Link
            to={logoHref}
            className="mx-auto flex w-[200px] cursor-pointer items-center object-contain px-4 pt-5 text-white"
          >
            <img
              src="/logo/logo_hoyadelantas_white_over_blue.png"
              alt="Logo HoyAdelantas"
              width="168"
              height="29"
            />
          </Link>

          <div className="pb-10" />

          <nav
            className="flex flex-col text-sm font-medium text-gray-200"
            aria-label="Main Navigation"
          >
            {paths.map(({ title, icon, path, subPaths }) => {
              if (subPaths?.length) {
                return (
                  <NavDropdownItem
                    key={title}
                    title={title}
                    icon={icon}
                    path={path}
                    subPaths={subPaths}
                    variant={variant}
                  />
                )
              }
              return (
                <NavItem
                  key={title}
                  title={title}
                  icon={icon}
                  path={path}
                  variant={variant}
                />
              )
            })}

            <RemixForm
              action="/logout"
              method="post"
              className="absolute bottom-2 mt-auto w-full"
            >
              <NavItem
                title="Cerrar sesión"
                icon={HiLogout}
                variant={variant}
                type="submit"
              />
            </RemixForm>
          </nav>
        </nav>

        <div className="ml-0 flex flex-1 flex-col px-3 py-6 transition md:ml-60 md:p-4 md:pl-0">
          <DashboardNavbar
            setShowSideBar={setShowSideBar}
            user={user}
            isAdmin={isAdmin}
          />

          <div className="flex flex-1 flex-col rounded-b-[15px] bg-gray-100 p-4">
            {children}
          </div>
        </div>

        <Transition
          show={showSideBar}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="fixed inset-0 z-10 h-screen w-screen bg-black bg-opacity-25 md:hidden" />
        </Transition>
      </section>
    </>
  )
}
