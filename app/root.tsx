import React, { useEffect } from 'react'
import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useDataRefresh } from 'remix-utils'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import { getUser } from './session.server'
import tailwindStylesheetUrl from './styles/tailwind.css'

export const links: LinksFunction = () => {
  return [
    { rel: 'shortcut icon', href: '/favicon.png' },
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700;800&display=swap',
    },
  ]
}

// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85?permalink_comment_id=3886909#gistcomment-3886909
if (typeof document === 'undefined') React.useLayoutEffect = React.useEffect

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'HoyAdelantas',
  viewport: 'width=device-width,initial-scale=1',
})

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  })
}

export default function App() {
  const { refresh } = useDataRefresh()

  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      typeof window !== 'undefined' &&
      window.addEventListener
    ) {
      window.addEventListener('visibilitychange', refresh, false)
      window.addEventListener('focus', refresh, false)
    }

    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [refresh])

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
