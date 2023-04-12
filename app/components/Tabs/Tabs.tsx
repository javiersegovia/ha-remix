import { Link, useLocation } from '@remix-run/react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export type TabItem = {
  title: string
  path: string
  disabled?: boolean
}

/** This function is used to style the "active" path inside the navigation bar */
const currentLocationIsInsideNavPath = (
  currentPath: string,
  navPath: string
) => {
  // todo: refactor this validation
  if (currentPath === navPath) return true // Same path
  if (currentPath.includes(navPath)) return true // In a child path

  return false
}

export enum TabDesign {
  DEFAULT = 'DEFAULT',
  UNDERLINE = 'UNDERLINE',
}

interface TabsProps {
  items: TabItem[]
  design?: TabDesign
  className?: string
}

export const Tabs = ({
  items,
  className,
  design = TabDesign.DEFAULT,
}: TabsProps) => {
  const { pathname, search } = useLocation()

  return (
    <nav className={twMerge(clsx('', className))}>
      <div
        className={twMerge(
          clsx(
            'relative inline-flex rounded-lg border border-steelBlue-200/50 bg-steelBlue-100/50 text-sm',
            design === TabDesign.UNDERLINE &&
              'grid grid-flow-col rounded-none border-0 border-b-2 bg-transparent'
          )
        )}
      >
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className={twMerge(
              clsx(
                'relative col-span-1 flex cursor-pointer items-center justify-center py-2 px-12 text-sm font-medium text-steelBlue-700',
                design === TabDesign.UNDERLINE && 'text-lg font-bold',

                item.disabled &&
                  'pointer-events-none cursor-not-allowed opacity-40',

                currentLocationIsInsideNavPath(
                  `${pathname}${search}`,
                  item.path
                ) &&
                  'rounded-lg bg-white px-16 font-bold tracking-wide text-steelBlue-700'
              ),

              currentLocationIsInsideNavPath(
                `${pathname}${search}`,
                item.path
              ) &&
                design === TabDesign.UNDERLINE &&
                'rounded-none bg-transparent text-steelBlue-500'
            )}
          >
            {item.title}

            {currentLocationIsInsideNavPath(
              `${pathname}${search}`,
              item.path
            ) &&
              design === TabDesign.UNDERLINE && (
                <div className="absolute -bottom-1 h-1 w-full bg-steelBlue-500" />
              )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
