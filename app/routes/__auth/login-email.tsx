import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { requestLoginLink } from '~/services/auth.server'
import { getUserIdFromSession } from '~/session.server'
import { loginEmailValidator } from '~/schemas/login.schema'
import { Input } from '~/components/FormFields/Input'
import { Button } from '~/components/Button'
import { Title } from '~/components/Typography/Title'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { SubmitButton } from '~/components/SubmitButton'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserIdFromSession(request)
  if (userId) return redirect('/')
  return null
}

export async function action({ request }: ActionArgs) {
  const { data, submittedData, error } = await loginEmailValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await requestLoginLink(data.email)
  return redirect('/login-requested')
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio de sesión | HoyAdelantas',
  }
}

export default function LoginEmailRoute() {
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
          className="mx-auto block"
          src="/logo/logo_hoyadelantas_white_over_green.png"
          alt="Logo HoyAdelantas"
          width="256"
          height="44.2"
        />

        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <Title className="mb-8 text-center">Inicio de sesión</Title>

          <ValidatedForm
            validator={loginEmailValidator}
            className="space-y-4"
            method="post"
          >
            <Input
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="Ingresa tu correo"
            />

            <SubmitButton>Solicitar enlace de ingreso</SubmitButton>

            <div className="w-full border-b border-gray-300 pt-4" />

            <div className="pt-3">
              <Button
                type="button"
                href="/login"
                variant="LIGHT"
                className="text-sm"
              >
                Ingresar usando correo y contraseña
              </Button>
            </div>
          </ValidatedForm>
        </div>
      </div>
    </section>
  )
}
