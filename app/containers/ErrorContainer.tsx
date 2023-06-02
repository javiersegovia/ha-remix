import React from 'react'
import { Button, ButtonColorVariants } from '~/components/Button'

interface ErrorContainerProps {
  title: string
  message?: React.ReactNode | string | null
  showSuggestions?: boolean
  errorString?: string
}

export default function ErrorContainer({
  title,
  message,
  errorString,
  showSuggestions = false,
}: ErrorContainerProps) {
  const isDev = process.env.NODE_ENV === 'development'
  const preMessage = message
    ? 'Algo salió mal con tu solicitud:'
    : 'Algo salió mal, y estamos trabajando para arreglar el problema.'

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gray-50 sm:bg-steelBlue-900">
      <div className="my-10 max-w-2xl rounded-md bg-gray-50 px-8 py-10 text-center lg:min-w-[400px]">
        <h1 className="text-4xl font-bold text-red-500">{title}</h1>

        <section className="mt-10 text-left">
          <>
            <p className="font-semibold">Lo sentimos.</p>
            <p>{preMessage}</p>
          </>

          {message && (
            <p className="mx-auto mt-6 rounded-md bg-red-200 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          {(showSuggestions || !message) && (
            <>
              <p className="mt-6">
                Mientras tanto, esto es lo que puedes hacer:
              </p>
              <ul className="list-disc">
                <li className="ml-4 mt-6">
                  Refrescar la página (a veces esto ayuda).
                </li>
                <li className="ml-4">Intentar de nuevo en 30 minutos.</li>
                <li className="ml-4">
                  Escribirnos a{' '}
                  <span className="font-semibold text-steelBlue-600">
                    hoyadelantas@hoytrabajas.com
                  </span>{' '}
                  y explicarnos lo que ocurre.
                </li>
              </ul>
            </>
          )}
        </section>

        <Button
          href="/"
          external
          className="mx-auto mt-10"
          variant={ButtonColorVariants.SECONDARY}
        >
          Volver al inicio
        </Button>

        {isDev && errorString && (
          <p className="mx-auto mt-6 rounded-md bg-red-200 p-3 text-sm text-red-700">
            {errorString}
          </p>
        )}
      </div>
    </section>
  )
}
