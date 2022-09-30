import clsx from 'clsx'
import { Link, useLocation } from '@remix-run/react'
import type { IconType } from 'react-icons'
import type { DashboardColorVariant } from './DashboardSideBar'

type TNavItemProps =
  | {
      path: string
      title: string
      type?: never
      variant?: DashboardColorVariant
      className?: string
      icon?: IconType
    }
  | {
      title: string
      type?: 'submit' | 'button'
      path?: never
      variant?: DashboardColorVariant
      className?: string
      icon?: IconType
    }

interface INavItemContentProps extends Omit<TNavItemProps, 'path' | 'onClick'> {
  isCurrentPath: boolean
  isDark: boolean
}

export const NavItemContent = ({
  icon: Icon,
  title,
  isCurrentPath,
  isDark,
}: INavItemContentProps) => (
  <>
    {Icon && (
      <Icon
        className={clsx(
          'mr-2 h-5 w-5 flex-shrink-0',
          isCurrentPath && (isDark ? 'text-white' : 'text-steelBlue-400')
        )}
      />
    )}
    <span className="mt-[2px] whitespace-nowrap">{title}</span>
  </>
)

export const NavItem: React.FC<TNavItemProps> = ({
  icon,
  path,
  title,
  type = 'button',
  variant = 'PRIMARY',
  ...props
}) => {
  const location = useLocation()
  const isCurrentPath = location.pathname === path

  const isPrimary = variant === 'PRIMARY'
  const isDark = variant === 'DARK'

  return (
    <div {...props}>
      {path ? (
        <Link
          to={path}
          className={clsx(
            'group flex cursor-pointer items-center rounded-2xl py-3 pl-6 text-base font-bold transition',
            isPrimary &&
              (isCurrentPath
                ? 'bg-steelBlue-200 text-steelBlue-400'
                : 'hover:bg-steelBlue-200 hover:text-steelBlue-400'),
            isDark &&
              (isCurrentPath ? 'bg-gray-700 text-white' : 'hover:bg-gray-700')
          )}
        >
          <NavItemContent
            icon={icon}
            title={title}
            isCurrentPath={isCurrentPath}
            isDark={isDark}
          />
        </Link>
      ) : (
        <button
          type={type}
          className={clsx(
            'group flex w-full cursor-pointer items-center rounded-2xl py-3 pl-6 text-base font-bold transition',
            isPrimary &&
              (isCurrentPath
                ? 'bg-steelBlue-200 text-steelBlue-400'
                : 'hover:bg-steelBlue-200 hover:text-steelBlue-400'),
            isDark &&
              (isCurrentPath ? 'bg-gray-700 text-white' : 'hover:bg-gray-700')
          )}
        >
          <NavItemContent
            icon={icon}
            title={title}
            isCurrentPath={isCurrentPath}
            isDark={isDark}
          />
        </button>
      )}
    </div>
  )
}
