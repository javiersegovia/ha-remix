import clsx from 'clsx'
import { NavLink } from '@remix-run/react'

type NavigationProps = {
  navigation: {
    title: string
    links: {
      title: string
      href: string
    }[]
  }[]
  className?: string
}

export default function Navigation({ navigation, className }: NavigationProps) {
  return (
    <nav className={clsx('text-base lg:text-sm', className)}>
      <ul className="space-y-9">
        {navigation &&
          navigation.map((section) => (
            <li key={section.title}>
              <h2 className="font-display font-medium text-slate-900">
                {section.title}
              </h2>

              <ul className="mt-2 space-y-2 border-l-2 border-slate-100 lg:mt-4 lg:space-y-4 lg:border-slate-200">
                {section.links.map((link, i) => (
                  <li key={link.href} className="relative">
                    <NavLink
                      to={link.href}
                      end={i == 0 ? true : false}
                      prefetch="intent"
                      className={({ isActive }) =>
                        clsx(
                          'block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full',
                          isActive
                            ? 'font-semibold text-sky-500 before:bg-sky-500'
                            : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block'
                        )
                      }
                    >
                      {link.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </nav>
  )
}
