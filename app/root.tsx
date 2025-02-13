import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node'

import React, { useEffect, useRef } from 'react'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
  useRevalidator,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react'

import { toast, ToastBar, Toaster } from 'react-hot-toast'

import clsx from 'clsx'
import { RiCheckboxCircleFill, RiCloseFill } from 'react-icons/ri'
import { MdOutlineError } from 'react-icons/md'

import NProgress from 'nprogress'
import nProgressStyles from 'nprogress/nprogress.css'
import reactSlickStylesheetUrl from 'slick-carousel/slick/slick.css'
import reactSlickThemeStylesheetUrl from 'slick-carousel/slick/slick-theme.css'

import {
  SUCCESS_FLASH_KEY,
  ERROR_FLASH_KEY,
  getSession,
  getUser,
  sessionStorage,
} from './session.server'
import baseStyles from './styles/base.css'
import ErrorContainer from './containers/ErrorContainer'

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
    { rel: 'stylesheet', href: reactSlickStylesheetUrl },
    { rel: 'stylesheet', href: reactSlickThemeStylesheetUrl },
    { rel: 'stylesheet', href: baseStyles },
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
  title: 'HoyTrabajas Beneficios',
  viewport: 'width=device-width,initial-scale=1',
})

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request)
  const success = (session.get(SUCCESS_FLASH_KEY) as string) || null
  const error = (session.get(ERROR_FLASH_KEY) as string) || null

  return json(
    {
      message: {
        success,
        error,
      },
      user: await getUser(request),
    },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    }
  )
}

export default function App() {
  const { message } = useLoaderData<typeof loader>()
  const location = useLocation()
  const { state } = useNavigation()
  const revalidator = useRevalidator()
  const isProd = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (message.success) {
      toast.success(message.success, { duration: 5000 })
    }
    if (message.error) {
      toast.error(message.error, { duration: Infinity })
    }
  }, [message])

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
    if (state !== 'idle') {
      nProgressTimeoutRef.current = setTimeout(() => NProgress.start(), 700)
    } else {
      clearTimeout(nProgressTimeoutRef.current)
      NProgress.done()
    }

    return () => {
      clearTimeout(nProgressTimeoutRef.current)
    }
  }, [state])

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

      <body className="h-full min-h-full">
        {isProd && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5SRTQ7B"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        )}

        <Toaster position="top-right">
          {(t) => (
            <ToastBar
              toast={t}
              style={{
                padding: 0,
                alignItems: 'flex-start',
                boxShadow: 'none',
              }}
            >
              {({ message }) => (
                <div
                  className={clsx(
                    'flex justify-between rounded-md border px-6 py-2 text-sm font-medium text-black shadow-md',
                    t.type === 'success' && 'border-green-400 bg-green-100',
                    t.type === 'error' && 'border-red-400  bg-red-50'
                  )}
                >
                  {t.type === 'success' && (
                    <RiCheckboxCircleFill className="my-1 mr-3 min-w-[2rem] text-3xl text-green-500" />
                  )}

                  {t.type === 'error' && (
                    <MdOutlineError className="my-1 mr-3 min-w-[2rem] text-3xl text-red-500" />
                  )}

                  {message}

                  {t.type === 'error' && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="my-1 flex text-xl text-gray-400"
                    >
                      <RiCloseFill />
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? error.data?.message || error.statusText
    : error instanceof Error
    ? error.message
    : 'Error desconocido'

  return (
    <html lang="es" className="h-full">
      <head>
        <title>Error | HoyTrabajas Beneficios</title>
        <Meta />
        <Links />
      </head>

      <body>
        <ErrorContainer title="Oops. Error." message={message} />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
