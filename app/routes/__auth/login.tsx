import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Link,
  useActionData,
  useSearchParams,
  useTransition,
} from '@remix-run/react'

import { verifyUserLogin } from '~/services/user.server'
import { createUserSession, getUserIdFromSession } from '~/session.server'
import { safeRedirect } from '~/utils/utils'
import { validateSchema } from '~/utils/validation'
import { loginSchema } from '~/schemas/login.schema'
import type { LoginSchemaInput } from '~/schemas/login.schema'
import { Form, useForm } from '~/components/FormFields/Form'
import { Input } from '~/components/FormFields/Input'
import { Button } from '~/components/Button'
import { Title } from '~/components/Typography/Title'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserIdFromSession(request)
  if (userId) return redirect('/')
  return null
}

export async function action({ request }: ActionArgs) {
  const { formData, errors } = await validateSchema<LoginSchemaInput>({
    request,
    schema: loginSchema,
  })

  if (errors) {
    return json({ formData, errors }, { status: 400 })
  }

  const { email, password, redirectTo } = formData
  const user = await verifyUserLogin(email, password)

  if (!user) {
    return json(
      {
        formData,
        errors: {
          email: 'Correo o contraseña inválida',
          password: 'Correo o contraseña inválida',
        },
      },
      { status: 400 }
    )
  }

  let redirectPath = redirectTo

  if (
    !user.employee?.acceptedPrivacyPolicy &&
    !user.employee?.acceptedTermsOfService
  ) {
    redirectPath = '/dashboard/welcome'
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: safeRedirect(redirectPath, '/dashboard'),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio de sesión',
  }
}

export default function LoginRoute() {
  const transition = useTransition()

  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const actionData = useActionData<typeof action>()

  const { formData, errors } = actionData || {}

  const isLoading =
    transition.state === 'submitting' || transition.state === 'loading'

  const formProps = useForm({ schema: loginSchema, method: 'post' })

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
      <div className="container mx-auto px-0 pt-20 sm:px-4">
        <img
          className="mx-auto block"
          src="/logo/logo_hoyadelantas_white_over_green.png"
          alt="Logo HoyAdelantas"
          width="256"
          height="44.2"
        />

        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <Title className="mb-4 text-center">Inicio de sesión</Title>

          <Form {...formProps}>
            <fieldset disabled={isLoading} className="space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <Input
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="Ingresa tu correo"
                disabled={isLoading}
                error={errors?.email}
                defaultValue={formData?.email}
              />
              <Input
                name="password"
                type="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                disabled={isLoading}
                error={errors?.password}
                defaultValue={formData?.password}
              />

              <Button type="submit" showCheckOnSuccess>
                Ingresar
              </Button>

              <div className="w-full border-b border-gray-300 pt-4" />

              <div className="pt-3">
                <Button
                  type="button"
                  href="/login-email"
                  variant="LIGHT"
                  className="text-sm"
                >
                  Ingresar usando correo electrónico
                </Button>
              </div>
            </fieldset>
          </Form>
        </div>
      </div>

      <div className="pb-4 text-center">
        <Link
          to="/request-password"
          type="button"
          className="text-sm font-semibold text-white"
        >
          Recuperar contraseña
        </Link>
      </div>
    </section>
  )
}
