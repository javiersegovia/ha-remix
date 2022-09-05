import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  useActionData,
  useSearchParams,
  // useSubmit,
  useTransition,
} from '@remix-run/react'

import { createAdminSession, getAdminUserIdFromSession } from '~/session.server'
import { safeRedirect } from '~/utils/utils'
import { validateSchema } from '~/utils/validation'

import { loginSchema } from '~/schemas/login.schema'
import type { LoginSchemaInput } from '~/schemas/login.schema'

import { verifyAdminUserLogin } from '~/services/admin-user.server'
import { Button } from '~/components/Button'
import { Input } from '~/components/FormFields/Input'
import { Form, useForm } from '~/components/FormFields/Form'

export async function loader({ request }: LoaderArgs) {
  const adminUserId = await getAdminUserIdFromSession(request)
  if (adminUserId) return redirect('/admin/dashboard')
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
  const adminUser = await verifyAdminUserLogin(email, password)

  if (!adminUser) {
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

  return createAdminSession({
    request,
    adminUserId: adminUser.id,
    redirectTo: safeRedirect(redirectTo, '/'),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Inicio de sesión',
  }
}

export default function AdminLoginRoute() {
  const transition = useTransition()

  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard'
  const actionData = useActionData<typeof action>()

  const { formData, errors } = actionData || {}

  const isLoading =
    transition.state === 'submitting' || transition.state === 'loading'

  const formProps = useForm({ schema: loginSchema, method: 'post' })

  return (
    <section className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-0 py-20 sm:px-4">
        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <h1 className="mb-8 text-center text-3xl font-semibold uppercase text-gray-900">
            ADMIN
          </h1>

          <Form {...formProps}>
            <fieldset disabled={isLoading} className="space-y-6">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <Input
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="Correo de administrador"
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
            </fieldset>
          </Form>
        </div>
      </div>
    </section>
  )
}
