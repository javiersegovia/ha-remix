import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { getGlobalSettings } from '~/services/global-settings/global-settings.server'

import { validationError } from 'remix-validated-form'
import { redirect } from '@remix-run/server-runtime'
import { upsertGlobalSettings } from '~/services/global-settings/global-settings.server'

import { json } from '@remix-run/server-runtime'
import { ValidatedForm, setFormDefaults } from 'remix-validated-form'
import { FormActions } from '~/components/FormFields/FormActions'
import { Input } from '~/components/FormFields/Input'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { globalSettingsValidator } from '~/services/global-settings/global-settings.schema'
import { requireAdminUserId } from '~/session.server'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { Container } from '~/components/Layout/Container'

const globalSettingsFormId = 'GlobalSettingsForm' as const

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  const globalSettings = await getGlobalSettings()

  return json({
    globalSettings: null,
    ...setFormDefaults(globalSettingsFormId, {
      daysWithoutRequestsBeforePaymentDay:
        globalSettings?.daysWithoutRequestsBeforePaymentDay,
      annualInterestRate: globalSettings?.annualInterestRate,
      transportationAid: globalSettings?.transportationAid,
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
    <Container className="pb-10">
      <ValidatedForm
        id={globalSettingsFormId}
        method="post"
        validator={globalSettingsValidator}
      >
        <Title className="mb-8 mt-2">Configuración general</Title>

        <Box className="p-5">
          <div className="grid grid-cols-12 gap-5">
            <FormGridItem>
              <Input
                name="annualInterestRate"
                type="number"
                label="Tasa de interés anual"
                placeholder="Porcentaje de tasa de interés anual"
                step="0.01"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="daysWithoutRequestsBeforePaymentDay"
                type="number"
                label="Días sin solicitudes antes de una fecha de pago"
                placeholder="Cantidad de días a limitar"
              />
            </FormGridItem>

            <FormGridItem>
              <Input
                name="transportationAid"
                type="number"
                label="Auxilio de Transporte (Adelanto de Prima)"
                placeholder="Monto de auxilio de transporte"
              />
            </FormGridItem>
          </div>

          <FormActions title="Guardar" />
        </Box>
      </ValidatedForm>
    </Container>
  )
}
