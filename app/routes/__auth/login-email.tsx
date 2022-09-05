import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useActionData, useTransition } from '@remix-run/react'

import { requestLoginLink } from '~/services/auth.server'
import { getUserIdFromSession } from '~/session.server'
import { validateSchema } from '~/utils/validation'
import { loginEmailSchema } from '~/schemas/login.schema'
import type { LoginEmailSchemaInput } from '~/schemas/login.schema'
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
  const { formData, errors } = await validateSchema<LoginEmailSchemaInput>({
    request,
    schema: loginEmailSchema,
  })

  if (errors) {
    return json({ formData, errors }, { status: 400 })
  }

  await requestLoginLink(formData.email)

  return redirect('/login-requested')
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio de sesión',
  }
}

export default function LoginEmailRoute() {
  const transition = useTransition()
  const actionData = useActionData<typeof action>()
  const { formData, errors } = actionData || {}

  const isLoading =
    transition.state === 'submitting' || transition.state === 'loading'

  const formProps = useForm({
    schema: loginEmailSchema,
    method: 'post',
  })

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

          <Form {...formProps}>
            <fieldset disabled={isLoading} className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="Ingresa tu correo"
                disabled={isLoading}
                error={errors?.email}
                defaultValue={formData?.email}
              />

              <Button type="submit" showCheckOnSuccess>
                Solicitar enlace de ingreso
              </Button>

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
            </fieldset>
          </Form>
        </div>
      </div>
    </section>
  )
}
