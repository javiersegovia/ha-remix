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
}

export const NavItemContent = ({
  icon: Icon,
  title,
  isCurrentPath,
}: INavItemContentProps) => (
  <>
    {Icon && (
      <Icon
        className={clsx(
          'mr-2 h-5 w-5 flex-shrink-0 transition',
          isCurrentPath ? 'text-gray-300' : 'text-gray-400'
        )}
      />
    )}
    <span>{title}</span>
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
    <div className="px-2 py-1" {...props}>
      {path ? (
        <Link
          to={path}
          className={clsx(
            'group flex cursor-pointer items-center rounded-[15px] px-4 py-3 transition',
            isPrimary &&
              (isCurrentPath
                ? 'bg-steelBlue-600 text-white'
                : 'hover:bg-steelBlue-600'),
            isDark &&
              (isCurrentPath ? 'bg-gray-700 text-white' : 'hover:bg-gray-700')
          )}
        >
          <NavItemContent
            icon={icon}
            title={title}
            isCurrentPath={isCurrentPath}
          />
        </Link>
      ) : (
        <button
          type={type}
          className={clsx(
            'group flex cursor-pointer items-center rounded-[15px] px-4 py-3 transition',
            isPrimary &&
              (isCurrentPath
                ? 'bg-steelBlue-600 text-white'
                : 'hover:bg-steelBlue-600'),
            isDark &&
              (isCurrentPath ? 'bg-gray-700 text-white' : 'hover:bg-gray-700')
          )}
        >
          <NavItemContent
            icon={icon}
            title={title}
            isCurrentPath={isCurrentPath}
          />
        </button>
      )}
    </div>
  )
}
