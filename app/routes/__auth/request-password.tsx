import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { requestPasswordChange } from '~/services/auth.server'
import { getUserIdFromSession } from '~/session.server'
import { loginEmailValidator } from '~/schemas/login.schema'
import { Input } from '~/components/FormFields/Input'
import { Button, ButtonColorVariants } from '~/components/Button'
import { Title } from '~/components/Typography/Title'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { SubmitButton } from '~/components/SubmitButton'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserIdFromSession(request)
  if (userId) return redirect('/dashboard')
  return null
}

export async function action({ request }: ActionArgs) {
  const { data, submittedData, error } = await loginEmailValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await requestPasswordChange(data.email)
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
          className="mx-auto block object-contain"
          src="/images/logos/logo_umany_benefits_white_blue.png"
          alt="Logo Umany"
          width="200"
        />

        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <Title className="mb-8 text-center">Recuperar contraseña</Title>

          <p className="pb-7 text-center text-sm">
            Para recuperar tu contraseña, haz click en el enlace que enviaremos
            a tu correo electrónico
          </p>

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

            <SubmitButton>Solicitar enlace de recuperación</SubmitButton>

            <div className="w-full border-b border-gray-300 pt-4" />

            <div className="pt-3">
              <Button
                type="button"
                href="/login"
                variant={ButtonColorVariants.SECONDARY}
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
