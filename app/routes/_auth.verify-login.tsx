import type { LoaderArgs } from '@remix-run/server-runtime'
import { $path } from 'remix-routes'
import { Button, ButtonColorVariants } from '~/components/Button'
import { Title } from '~/components/Typography/Title'
import { verifyLoginLink } from '~/services/auth.server'
import { createUserSession } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const updatePassword = url.searchParams.get('updatePassword')

  if (!token) {
    return null
  }

  let redirectPath = $path('/dashboard/overview')

  try {
    const { user, hasPassword, hasAcceptedTerms } = await verifyLoginLink(token)

    if (updatePassword) {
      redirectPath = $path('/update-password')
    }

    if (!hasPassword || !hasAcceptedTerms) {
      redirectPath = $path('/dashboard/welcome')
    }

    return await createUserSession({
      request,
      userId: user.id,
      redirectTo: redirectPath,
    })
  } catch (err) {
    return null
  }
}

export default function VerifyLoginRoute() {
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
          <Title className="mb-4 text-center text-lg text-red-500">
            Tu enlace es inválido o ha expirado
          </Title>

          <Button
            href="/login-email"
            className="mt-6 text-sm"
            variant={ButtonColorVariants.SECONDARY}
          >
            Haz click aquí para solicitar uno nuevo
          </Button>
        </div>
      </div>
    </section>
  )
}
