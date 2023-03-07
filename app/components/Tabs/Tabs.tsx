import { Link, useLocation } from '@remix-run/react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Box } from '../Layout/Box'

export type TabItem = {
  title: string
  path: string
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

interface TabsProps {
  items: TabItem[]
  className?: string
}

export const Tabs = ({ items, className }: TabsProps) => {
  const { pathname, search } = useLocation()

  return (
    <div className={twMerge(clsx('grid grid-cols-12 gap-6', className))}>
      <div className="col-span-12">
        <nav className="col-span-12 flex flex-col-reverse lg:col-span-4 lg:block 2xl:col-span-4">
          <Box className="grid grid-flow-col overflow-hidden rounded-lg p-[6px] text-sm">
            {items.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={twMerge(
                  clsx(
                    'col-span-1 flex cursor-pointer items-center justify-center p-5 text-sm font-medium text-gray-500',
                    currentLocationIsInsideNavPath(
                      `${pathname}${search}`,
                      item.path
                    ) &&
                      'rounded-md bg-steelBlue-100 font-semibold tracking-wide text-gray-700'
                  )
                )}
              >
                {item.title}
              </Link>
            ))}
          </Box>
        </nav>
      </div>
    </div>
  )
}
