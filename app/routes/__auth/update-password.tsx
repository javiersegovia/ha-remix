import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { Input } from '~/components/FormFields/Input'
import { SubmitButton } from '~/components/SubmitButton'
import { Title } from '~/components/Typography/Title'
import { welcomeSchema } from '~/schemas/welcome.schema'
import { updatePassword } from '~/services/auth.server'
import { requireUserId } from '~/session.server'

const updatePasswordSchema = welcomeSchema.pick({
  password: true,
  confirmPassword: true,
})
const passwordValidator = withZod(updatePasswordSchema)

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const { data, submittedData, error } = await passwordValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await updatePassword(userId, data.password)
  return redirect('/dashboard')
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return null
}

export const meta: MetaFunction = () => {
  return {
    title: 'Modificar contraseña | HoyAdelantas',
  }
}

export default function UpdatePasswordRoute() {
  return (
    <section className="min-h-screen bg-steelBlue-900 py-20">
      <div className="container mx-auto px-0 sm:px-4">
        <img
          className="mx-auto block"
          src="/logo/logo_hoyadelantas_white_over_blue.png"
          alt="Logo HoyAdelantas"
          width="256"
          height="44.2"
        />

        <div className="mx-auto mb-6 mt-8 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12">
          <>
            <Title className="mb-4 text-center text-3xl font-semibold text-steelBlue-600">
              Modificar contraseña
            </Title>

            <ValidatedForm validator={passwordValidator} method="put">
              <FormGridItem>
                <Input
                  name="password"
                  type="password"
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="off"
                />
              </FormGridItem>

              <FormGridItem>
                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirmar contraseña"
                  placeholder="Ingresa de nuevo tu contraseña"
                />
              </FormGridItem>

              <SubmitButton>Guardar</SubmitButton>
            </ValidatedForm>
          </>
        </div>
      </div>
    </section>
  )
}
