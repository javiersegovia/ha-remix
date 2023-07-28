import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, useSearchParams } from '@remix-run/react'
import { ValidatedForm, validationError } from 'remix-validated-form'

import { verifyUserLogin } from '~/services/user/user.server'
import { createUserSession, getEmployee } from '~/session.server'
import { safeRedirect } from '~/utils/utils'
import { loginValidator } from '~/schemas/login.schema'
import { Input } from '~/components/FormFields/Input'
import { Button, ButtonColorVariants } from '~/components/Button'
import { Title } from '~/components/Typography/Title'
import { SubmitButton } from '~/components/SubmitButton'

export async function loader({ request }: LoaderArgs) {
  const employee = await getEmployee(request)

  if (employee) {
    if (employee.company.isBlacklisted) {
      return redirect('/dashboard')
    }
    return redirect('/home')
  }

  return null
}

export async function action({ request }: ActionArgs) {
  const { data, submittedData, error, formId } = await loginValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  const { email, password, redirectTo } = data
  const user = await verifyUserLogin(email, password)

  if (!user) {
    return validationError(
      {
        fieldErrors: {
          email: 'Correo o contraseña inválida',
          password: 'Correo o contraseña inválida',
        },
        formId,
      },
      submittedData
    )
  }

  // todo: check if user has signed terms in Zapsign

  let redirectPath = redirectTo
  let baseRedirectPath: string

  if (user.employee?.company?.isBlacklisted) {
    baseRedirectPath = '/dashboard/overview'
  } else {
    baseRedirectPath = '/home'
  }

  if (
    !user.employee?.acceptedPrivacyPolicy &&
    !user.employee?.acceptedTermsOfService
  ) {
    redirectPath = '/dashboard/welcome'
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: safeRedirect(redirectPath, baseRedirectPath),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Inicio de sesión | HoyTrabajas Beneficios',
  }
}

export default function LoginRemixRoute() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''

  return (
    <section className="min-h-screen bg-[#43ab89]">
      <div
        className="min-h-screen"
        style={{
          background:
            'url(https://ht-assets-images.s3.amazonaws.com/login/home-ingreso.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="container mx-auto px-0 pt-20 sm:px-4">
          <img
            className="mx-auto block object-contain"
            src="/images/logos/logo_umany_benefits_white_blue.png"
            alt="Logo Umany"
            width="200"
          />
          <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
            <Title className="mb-4 text-center">¡Bienvenido!</Title>
            <ValidatedForm
              validator={loginValidator}
              method="post"
              className="space-y-4"
            >
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Input
                name="email"
                type="email"
                role="email"
                label="Correo electrónico"
                placeholder="Ingresa tu correo"
              />
              <Input
                name="password"
                type="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
              />
              <SubmitButton data-testid="login-button">Ingresar</SubmitButton>
              <div className="w-full border-b border-gray-300 pt-4" />

              <div className="pt-3">
                <Button
                  type="button"
                  href="/login-email"
                  variant={ButtonColorVariants.SECONDARY}
                  className="text-sm leading-6"
                  data-testid="login-email-button"
                >
                  Ingresar usando correo electrónico
                </Button>
              </div>
            </ValidatedForm>
          </div>
        </div>
        <div className="pb-4 text-center">
          <Link
            to="/request-password"
            className="text-sm font-semibold text-white"
          >
            Recuperar contraseña
          </Link>
        </div>
      </div>
    </section>
  )
}
