import type {
  ErrorBoundaryComponent,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/node'

import React, { useEffect, useRef } from 'react'
import { json } from '@remix-run/node'
import { useDataRefresh } from 'remix-utils'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
  useTransition,
} from '@remix-run/react'

import NProgress from 'nprogress'
import nProgressStyles from 'nprogress/nprogress.css'

import * as gtag from '~/utils/gtag.client'
import { getUser } from './session.server'
import tailwindStylesheetUrl from './styles/tailwind.css'
import ErrorContainer from './containers/ErrorContainer'

export const links: LinksFunction = () => {
  return [
    { rel: 'shortcut icon', href: '/favicon.png' },
    { rel: 'stylesheet', href: nProgressStyles },
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

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>
  gaTrackingId: string | undefined
}

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
    gaTrackingId: process.env.GA_TRACKING_ID,
  })
}

export default function App() {
  const location = useLocation()
  const transition = useTransition()
  const { refresh } = useDataRefresh()
  const { gaTrackingId } = useLoaderData<LoaderData>()

  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId)
    }
  }, [location, gaTrackingId])

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

  const nProgressTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    nProgressTimeoutRef.current && clearTimeout(nProgressTimeoutRef.current)

    // when the state is idle then we can to complete the progress bar
    if (transition.state !== 'idle') {
      nProgressTimeoutRef.current = setTimeout(() => NProgress.start(), 700)
    } else {
      clearTimeout(nProgressTimeoutRef.current)
      NProgress.done()
    }

    return () => {
      clearTimeout(nProgressTimeoutRef.current)
    }
  }, [transition.state])

  return (
    <html lang="es" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="h-full">
        {process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test' ||
        !gaTrackingId ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)
  return (
    <html lang="es" className="h-full">
      <head>
        <title>Error | HoyAdelantas</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorContainer
          title="Bueno, esto es inesperado..."
          errorString={error.message}
          showSuggestions
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const CatchBoundary = () => {
  const caught = useCatch()
  const parsedData = caught?.data && JSON.parse(caught.data)
  const message = caught.statusText || parsedData?.message || parsedData

  return (
    <html lang="es" className="h-full">
      <head>
        <title>Error | HoyAdelantas</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorContainer
          title="Oops. Error."
          message={message}
          status={caught.status}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
