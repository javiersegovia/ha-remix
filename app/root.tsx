import type {
  ErrorBoundaryComponent,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/node'

import React, { useEffect, useRef } from 'react'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
  useTransition,
  useRevalidator,
} from '@remix-run/react'

import NProgress from 'nprogress'
import nProgressStyles from 'nprogress/nprogress.css'

import { getUser } from './session.server'
import tailwindStylesheetUrl from './styles/tailwind.css'
import ErrorContainer from './containers/ErrorContainer'
import { Toaster } from 'react-hot-toast'

export const links: LinksFunction = () => {
  return [
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
      crossOrigin: 'anonymous',
    },
    { rel: 'shortcut icon', href: '/favicon.png' },
    { rel: 'stylesheet', href: nProgressStyles },
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap',
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
  const location = useLocation()
  const transition = useTransition()
  const revalidator = useRevalidator()
  const isProd = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (
      typeof document !== 'undefined' &&
      typeof window !== 'undefined' &&
      window.addEventListener
    ) {
      window.addEventListener('visibilitychange', revalidator.revalidate, false)
      window.addEventListener('focus', revalidator.revalidate, false)
    }

    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener('visibilitychange', revalidator.revalidate)
      window.removeEventListener('focus', revalidator.revalidate)
    }
  }, [revalidator.revalidate])

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

        {isProd &&
          (location.pathname === '/dashboard/overview' ||
            location.pathname.includes('/dashboard/payroll-advances/') ||
            location.pathname.includes('/dashboard/premium-advances/')) && (
            <script
              async
              id="hotjar"
              dangerouslySetInnerHTML={{
                __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:3148054,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `,
              }}
            />
          )}

        {isProd && (
          <script
            async
            id="tagManager"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5SRTQ7B');`,
            }}
          />
        )}
      </head>

      <body className="min-h-full">
        {isProd && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5SRTQ7B"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            success: {
              className: 'text-green-600 text-sm font-medium',
            },
            error: {
              className: 'text-red-600 text-sm font-medium',
            },
          }}
        />

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
  const parsedData =
    caught?.data && typeof caught.data === 'object'
      ? JSON.parse(caught.data)
      : caught.data

  const message = parsedData?.message || parsedData || caught.statusText

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
