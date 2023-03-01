import type { PropsWithChildren } from 'react'
import type { IconType } from 'react-icons'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Form as RemixForm, Link, useTransition } from '@remix-run/react'
import { Transition } from '@headlessui/react'
import { HiLogout, HiMenu } from 'react-icons/hi'
import { RiCloseFill } from 'react-icons/ri'

import { useOnClickOutside } from '~/hooks/useOnClickOutside'
import { NavDropdownItem } from './NavDropdownItem'
import { NavItem } from './NavItem'

const LogoPoweredBy = ({
  href,
  className,
}: {
  href: string
  className?: string
}) => {
  return (
    <Link
      to={href}
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center object-contain text-center text-white',
        className
      )}
    >
      <img
        src="https://ht-benefits-assets.s3.amazonaws.com/logo_beneficios_blanco.png"
        alt="Logo HoyTrabajas Beneficios"
        width="168"
        height="29"
      />
      <p className="mt-2 hidden px-4 text-left text-xs md:block">
        2023-HoyTrabajas.com ® - Todos los derechos reservados.
      </p>
    </Link>
  )
}

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

export enum DashboardColorVariant {
  PRIMARY = 'PRIMARY',
  DARK = 'DARK',
}

interface DashboardSideBarProps {
  paths: INavPath[]
  logoHref: string
  variant?: DashboardColorVariant
}

export const DashboardSideBar = ({
  children,
  variant = DashboardColorVariant.PRIMARY,
  logoHref,
  paths,
}: PropsWithChildren<DashboardSideBarProps>) => {
  const transition = useTransition()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const navRef = useRef(null)
  useOnClickOutside(navRef, () => setShowMobileMenu(false))

  // Close mobile menu if open on client navigation
  useEffect(() => {
    if (showMobileMenu && transition.state !== 'idle') {
      setShowMobileMenu(false)
    }
  }, [transition.state, showMobileMenu, setShowMobileMenu])

  return (
    <>
      <section
        className={clsx(
          'flex min-h-screen flex-col bg-steelBlue-900',
          variant === 'DARK' && 'bg-gray-900'
        )}
      >
        {/* Mobile Navbar */}
        <section className="flex items-center justify-between px-5 py-2 md:hidden">
          <LogoPoweredBy href={logoHref} />

          <button
            type="button"
            onClick={() => setShowMobileMenu(true)}
            className="flex h-full items-center text-3xl text-white md:hidden"
          >
            <span className="sr-only">Menu</span>
            <HiMenu />
          </button>
        </section>

        <nav
          ref={navRef}
          className={clsx(
            'fixed left-0 top-0 z-20 flex w-full origin-left transform flex-col items-stretch overflow-y-auto overflow-x-hidden bg-steelBlue-900 px-3 pb-10 md:h-full md:w-56 md:translate-y-0',
            showMobileMenu ? 'translate-y-0' : '-translate-y-full',
            variant === 'DARK' && 'bg-gray-900'
          )}
        >
          <button
            type="button"
            onClick={() => setShowMobileMenu(false)}
            className="mt-4 mb-6 ml-auto flex items-center pr-2 text-3xl text-white md:hidden"
          >
            <span className="sr-only">Close Menu</span>
            <RiCloseFill />
          </button>

          <div
            className="flex flex-1 flex-col text-sm font-medium text-gray-200 md:pt-16"
            aria-label="Main Navigation"
          >
            <div className="space-y-4">
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
            </div>

            <RemixForm
              action="/logout"
              method="post"
              className="bottom-2 mt-4 w-full md:mt-auto"
            >
              <NavItem
                title="Cerrar sesión"
                icon={HiLogout}
                variant={variant}
                type="submit"
              />
            </RemixForm>
          </div>

          <div className="my-4 h-[0.5px] w-full bg-gray-500" />
          <LogoPoweredBy href={logoHref} className="mx-auto w-[200px]" />
        </nav>

        <div className="ml-0 flex flex-1 flex-col bg-gray-50 transition md:ml-56">
          {children}
        </div>

        <Transition show={showMobileMenu}>
          <div className="fixed inset-0 top-0 z-10 h-screen w-screen bg-gray-900 bg-opacity-70 md:hidden" />
        </Transition>
      </section>
    </>
  )
}
