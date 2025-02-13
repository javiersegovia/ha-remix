import type { LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { getUserIdFromSession } from '~/session.server'
import { Button } from '~/components/Button'
import { Title } from '~/components/Typography/Title'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserIdFromSession(request)
  if (userId) return redirect('/dashboard')
  return null
}

export const meta: MetaFunction = () => {
  return {
    title: 'Enlace enviado | HoyTrabajas Beneficios',
  }
}

/** The user is redirected to this page in two scenarios:
 *  1. He requested a login-link using his email
 *  2. He requested to change-password-link using his email
 *
 *  In both cases, we will mark the requested email as sent.
 */
export default function LoginRequestedRoute() {
  return (
    <section
      className="min-h-screen bg-gray-100"
      style={{
        background:
          'url(https://ht-assets-images.s3.amazonaws.com/login/home-ingreso.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="container mx-auto px-0 py-20 sm:px-4">
        <img
          className="mx-auto block object-contain"
          src="/images/logos/logo_umany_benefits_white_blue.png"
          alt="Logo Umany"
          width="200"
        />

        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <Title className="mb-4 text-center">Enlace enviado</Title>

          <p className="text-center">
            Para proceder, por favor haz click en el enlace que enviamos a tu
            correo electrónico.
          </p>

          <Button href="/login" className="mt-6 text-sm">
            Regresar al inicio de sesión
          </Button>
        </div>
      </div>
    </section>
  )
}
