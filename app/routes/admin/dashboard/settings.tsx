import type { FormDefaults } from 'remix-validated-form'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'
import { getGlobalSettings } from '~/services/global-settings/global-settings.server'

import { validationError } from 'remix-validated-form'
import { redirect } from '@remix-run/server-runtime'
import { upsertGlobalSettings } from '~/services/global-settings/global-settings.server'

// import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { ValidatedForm, setFormDefaults } from 'remix-validated-form'
import { FormActions } from '~/components/FormFields/FormActions'
import { Input } from '~/components/FormFields/Input'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { globalSettingsValidator } from '~/services/global-settings/global-settings.schema'
import { requireAdminUserId } from '~/session.server'

type LoaderData = {
  globalSettings: Awaited<ReturnType<typeof getGlobalSettings>>
}

const globalSettingsFormId = 'GlobalSettingsForm' as const
export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  const globalSettings = await getGlobalSettings()

  return json<LoaderData & FormDefaults>({
    globalSettings: null,
    ...setFormDefaults(globalSettingsFormId, {
      daysWithoutRequestsBeforePaymentDay:
        globalSettings?.daysWithoutRequestsBeforePaymentDay,
      annualInterestRate: globalSettings?.annualInterestRate,
    }),
  })
}
export const action: ActionFunction = async ({ request }) => {
  await requireAdminUserId(request)

  const { data, submittedData, error } = await globalSettingsValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await upsertGlobalSettings(data)
  return redirect('/admin/dashboard')
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Configuración General | HoyAdelantas',
  }
}

export default function AdminSettingsRoute() {
  return (
    <section className="mx-auto w-full max-w-screen-lg px-2 pb-10 sm:px-10">
      <ValidatedForm
        id={globalSettingsFormId}
        method="post"
        validator={globalSettingsValidator}
      >
        <Title as="h1" className="py-4">
          Configuración General
        </Title>

        <Box className="p-5">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-6">
              <Input
                name="annualInterestRate"
                type="number"
                label="Tasa de interés anual"
                placeholder="Porcentaje de tasa de interés anual"
                step="0.01"
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <Input
                name="daysWithoutRequestsBeforePaymentDay"
                type="number"
                label="Días sin solicitudes antes de una fecha de pago"
                placeholder="Cantidad de días a limitar"
              />
            </div>
          </div>

          <FormActions title="Guardar" />
        </Box>
      </ValidatedForm>
    </section>
  )
}
