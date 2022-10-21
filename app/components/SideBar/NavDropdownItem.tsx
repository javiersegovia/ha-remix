import type { IconType } from 'react-icons'
import type { DashboardColorVariant } from './DashboardSideBar'

import React, { useState } from 'react'
import { HiOutlineChevronDown } from 'react-icons/hi'
import { Link } from '@remix-run/react'
import { Transition } from '@headlessui/react'
import clsx from 'clsx'

import { useLocation } from '@remix-run/react'
import { NavItemContent } from './NavItem'

interface NavDropdownItemProps {
  icon?: IconType
  path?: string
  title: string
  variant?: DashboardColorVariant
  subPaths: {
    title: string
    path: string
  }[]
}

export const NavDropdownItem: React.FC<NavDropdownItemProps> = ({
  icon,
  title,
  variant = 'PRIMARY',
  subPaths,
}) => {
  const location = useLocation()
  const insideCurrentPath = subPaths.some((subPath) =>
    location.pathname.includes(subPath.path)
  )
  const [showDropdown, setShowDropdown] = useState(insideCurrentPath)

  return (
    <div className="px-2 py-1">
      <button
        type="button"
        className={clsx(
          'flex w-full cursor-pointer items-center rounded-full px-4 py-3 font-medium transition',
          variant === 'PRIMARY' &&
            (insideCurrentPath
              ? `bg-steelBlue-600 text-white`
              : `hover:bg-steelBlue-600`),
          variant === 'DARK' &&
            (insideCurrentPath ? `bg-gray-700 text-white` : `hover:bg-gray-700`)
        )}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <NavItemContent
          icon={icon}
          title={title}
          isCurrentPath={insideCurrentPath}
          isDark={variant === 'DARK'}
        />
        <div
          className={clsx(
            'ml-auto h-4 w-4 flex-shrink-0 transform transition',
            showDropdown && 'rotate-180'
          )}
        >
          <HiOutlineChevronDown />
        </div>
      </button>

      <Transition
        show={showDropdown}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="mb-1">
          {subPaths.map(({ path, title }) => (
            <Link
              key={title + path}
              to={path}
              className={clsx(
                'flex cursor-pointer items-center py-2 pl-10 pr-4 transition hover:text-white hover:underline',
                location.pathname === path && 'underline'
              )}
            >
              • {title}
            </Link>
          ))}
        </div>
      </Transition>
    </div>
  )
}
