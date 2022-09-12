import type { PropsWithChildren } from 'react'
import { Title } from '~/components/Typography/Title'
import clsx from 'clsx'
import { Box } from '~/components/Layout/Box'
import { Link, useLocation } from '@remix-run/react'
import type { Company } from '@prisma/client'

interface CompanyNavigationProps extends PropsWithChildren {
  company: Pick<Company, 'id' | 'name'>
}

/** This function is used to style the "active" path inside the navigation bar */
const currentLocationIsInsideNavPath = (
  currentPath: string,
  navPath: string,
  nestedPaths?: string[]
) => {
  if (currentPath === navPath) return true // Same path
  if (currentPath.includes(navPath)) return true // In a child path
  if (nestedPaths && nestedPaths.some((path) => currentPath === path)) {
    return true // Is inside nested route path
  }

  return false
}

export const CompanyNavigation = ({
  company,
  children,
}: CompanyNavigationProps) => {
  const { pathname, search } = useLocation()

  const navPaths = [
    {
      title: 'Información principal',
      path: `/admin/dashboard/companies/${company.id}?index`,
    },
    {
      title: 'Colaboradores',
      path: `/admin/dashboard/companies/${company.id}/employees`,
      nestedPaths: [
        `/admin/dashboard/companies/${company.id}/employees/create`,
      ],
    },
    {
      title: 'Novedades',
      path: `/admin/dashboard/companies/${company.id}/debts`,
    },
  ]

  return (
    <>
      <section className="mx-auto w-full max-w-screen-lg px-2 pb-10 sm:px-10">
        <div className="mt-8">
          <Title>{company?.name || 'Detalles de compañía'}</Title>
          <p className="mt-1 block text-xs uppercase text-gray-500">
            {company?.id}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <nav className="col-span-12 flex flex-col-reverse lg:col-span-4 lg:block 2xl:col-span-4">
              <Box className="border-radius[15px] mt-5 overflow-hidden">
                <div className="border-t border-gray-200 text-sm">
                  <div className="grid grid-cols-3">
                    {navPaths.map((navPath) => (
                      <Link
                        key={navPath.title}
                        to={navPath.path}
                        className={clsx(
                          'col-span-1 flex cursor-pointer items-center justify-center p-5 font-medium text-gray-500',
                          currentLocationIsInsideNavPath(
                            `${pathname}${search}`,
                            navPath.path,
                            navPath.nestedPaths
                          ) &&
                            'rounded-sm border-b-4 border-cyan-500 font-semibold text-gray-700'
                        )}
                      >
                        {navPath.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </Box>
            </nav>
          </div>

          <div className="col-span-12">{children}</div>
        </div>
      </section>
    </>
  )
}
