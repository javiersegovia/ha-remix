import { Outlet } from '@remix-run/react'
import Navigation from '~/components/SideBar/Navigation'

const paths = [
  {
    title: 'Super Admin',
    links: [
      { title: 'Inicio', href: '/docs/super-admin/' },
      { title: 'Compañías', href: '/docs/super-admin/companies' },
      {
        title: 'Compañías - Colaboradores',
        href: '/docs/super-admin/companies/employees',
      },
      {
        title: 'Compañías - Novedades',
        href: '/docs/super-admin/companies/debts',
      },
      {
        title: 'Adelantos',
        href: '/docs/super-admin/advances',
      },
    ],
  },
  {
    title: 'Dashboard de Clientes',
    links: [],
  },
]

const DocsLayoutRoute = ({ children }: any) => {
  return (
    <>
      <div className="max-w-8xl relative mx-auto flex h-full justify-center bg-white sm:px-2 lg:px-8 xl:px-12">
        <div className="hidden lg:relative lg:block lg:flex-none">
          <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 " />
          <div className="sticky top-[4.5rem] -ml-0.5 h-[calc(100vh-4.5rem)] overflow-y-auto py-16 pl-0.5">
            <div className="absolute top-16 bottom-0 right-0 hidden h-12 w-px bg-gradient-to-t from-slate-800" />
            <div className="absolute top-28 bottom-0 right-0 hidden w-px bg-slate-800" />
            <Navigation
              navigation={paths}
              className="w-64 pr-8 xl:w-72 xl:pr-16"
            />
          </div>
        </div>

        <div className="min-w-0 max-w-2xl flex-auto px-4 py-6 lg:max-w-none lg:pr-0 lg:pl-8 xl:px-16">
          <div className="prose w-full min-w-full">
            <Outlet />
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default DocsLayoutRoute
