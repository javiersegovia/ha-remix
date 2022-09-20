import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { useSearchParams } from '@remix-run/react'
import { ValidatedForm, validationError } from 'remix-validated-form'

import { createAdminSession, getAdminUserIdFromSession } from '~/session.server'
import { safeRedirect } from '~/utils/utils'
import { loginValidator } from '~/schemas/login.schema'
import { verifyAdminUserLogin } from '~/services/admin-user.server'
import { Button } from '~/components/Button'
import { Input } from '~/components/FormFields/Input'

export async function loader({ request }: LoaderArgs) {
  const adminUserId = await getAdminUserIdFromSession(request)
  if (adminUserId) return redirect('/admin/dashboard')
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
  const adminUser = await verifyAdminUserLogin(email, password)

  if (!adminUser) {
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

  return createAdminSession({
    request,
    adminUserId: adminUser.id,
    redirectTo: safeRedirect(redirectTo, '/'),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Inicio de sesión | HoyAdelantas',
  }
}

export default function AdminLoginRoute() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard'

  return (
    <section className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-0 py-20 sm:px-4">
        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <h1 className="mb-8 text-center text-3xl font-semibold text-gray-900">
            Administrador
          </h1>

          <ValidatedForm
            validator={loginValidator}
            className="space-y-6"
            method="post"
          >
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <Input
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="Correo de administrador"
            />
            <Input
              name="password"
              type="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
            />

            <Button type="submit" showCheckOnSuccess>
              Ingresar
            </Button>
          </ValidatedForm>
        </div>
      </div>
    </section>
  )
}
