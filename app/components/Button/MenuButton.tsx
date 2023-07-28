import type { IconType } from 'react-icons'
import { Menu, Transition } from '@headlessui/react'
import { Link } from '@remix-run/react'
import clsx from 'clsx'
import { HiEllipsisHorizontal } from 'react-icons/hi2'

interface MenuButtonProps {
  navigation: {
    name: string
    href: string
    preventScrollReset?: boolean
    Icon?: IconType
  }[]
}

export const MenuButton = ({ navigation }: MenuButtonProps) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300">
        <HiEllipsisHorizontal className="inline-block text-2xl text-gray-600" />
      </Menu.Button>

      <Transition
        enter="transition duration-200 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-100 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        className="relative z-10"
      >
        <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right divide-y divide-gray-100 rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {navigation.map(({ href, name, preventScrollReset, Icon }) => (
            <Menu.Item key={href}>
              {({ active }) => (
                <Link
                  preventScrollReset={preventScrollReset}
                  className={clsx(
                    'flex items-center gap-3 rounded-md p-1 text-sm',
                    active && 'bg-gray-100 text-green-600'
                  )}
                  to={href}
                >
                  {Icon && <Icon className="text-2xl" />}
                  {name}
                </Link>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
