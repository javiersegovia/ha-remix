import { Link, useLocation } from '@remix-run/react'
import clsx from 'clsx'
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
}

export const Tabs = ({ items }: TabsProps) => {
  const { pathname, search } = useLocation()

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <nav className="col-span-12 flex flex-col-reverse lg:col-span-4 lg:block 2xl:col-span-4">
          <Box className="border-radius[15px] overflow-hidden">
            <div className="border-t border-gray-200 text-sm">
              <div className="grid grid-flow-col">
                {items.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    className={clsx(
                      'col-span-1 flex cursor-pointer items-center justify-center p-5 text-sm font-medium text-gray-500',
                      currentLocationIsInsideNavPath(
                        `${pathname}${search}`,
                        item.path
                      ) &&
                        'rounded-sm border-b-4 border-cyan-500 font-semibold text-gray-700'
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </Box>
        </nav>
      </div>
    </div>
  )
}
