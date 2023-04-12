import type { ActionArgs } from '@remix-run/server-runtime'
import type { loader as companyDebtLoader } from '../$companyDebtId'
import type { ExtractRemixResponse } from '~/utils/type-helpers'

import { redirect } from '@remix-run/server-runtime'
import { badRequest } from '~/utils/responses'
import { ValidatedForm, validationError } from 'remix-validated-form'

import { Modal } from '~/components/Dialog/Modal'
import { Button, ButtonColorVariants } from '~/components/Button'
import { SubmitButton } from '~/components/SubmitButton'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import {
  CurrencyInput,
  CurrencySymbol,
} from '~/components/FormFields/CurrencyInput'

import { useMatchesData } from '~/utils/utils'

import { companyDebtValidator } from '~/services/company-debt/company-debt.schema'
import { updateCompanyDebt } from '~/services/company-debt/company-debt.server'
import { requireAdminUserId } from '~/session.server'

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { companyDebtId } = params

  if (!companyDebtId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la novedad',
      redirect: '/admin/dashboard',
    })
  }

  const { data, submittedData, error, formId } =
    await companyDebtValidator.validate(await request.formData())

  if (error) {
    return validationError(error, submittedData)
  }

  const result = await updateCompanyDebt(companyDebtId, data)

  if ('fieldErrors' in result) {
    return validationError({
      fieldErrors: result.fieldErrors,
      formId,
    })
  }

  return redirect(`/admin/dashboard/debts/${companyDebtId}`)
}

export default function UpdateDebtModalRoute() {
  const routeData = useMatchesData(
    'routes/admin/dashboard/debts/$companyDebtId'
  )
  const { companyDebt } =
    (routeData as ExtractRemixResponse<typeof companyDebtLoader>) || {}

  if (!companyDebt) {
    return null
  }

  const { fiatDebt, cryptoDebt } = companyDebt

  return (
    <Modal onCloseRedirectTo={`/admin/dashboard/debts/${companyDebt.id}`}>
      <div className="m-auto w-full max-w-lg text-left">
        <Box className="w-full p-6">
          <Title className="mb-8">Actualizar novedades</Title>

          <ValidatedForm
            method="post"
            validator={companyDebtValidator}
            defaultValues={{
              fiatDebt: fiatDebt
                ? {
                    totalAmount: fiatDebt.amount,
                    currentAmount: fiatDebt.currentAmount || 0,
                  }
                : undefined,
              cryptoDebt: cryptoDebt
                ? {
                    totalAmount: cryptoDebt.amount,
                    currentAmount: cryptoDebt.currentAmount || 0,
                  }
                : undefined,
            }}
          >
            <div className="space-y-10">
              {fiatDebt && (
                <div className="flex flex-col gap-5">
                  <CurrencyInput
                    name="fiatDebt.totalAmount"
                    label="Novedad total en moneda fiat"
                    placeholder="Valor total de la novedad"
                    symbol={CurrencySymbol.COP}
                  />
                  <CurrencyInput
                    name="fiatDebt.currentAmount"
                    label="Novedad actual en moneda fiat"
                    placeholder="Valor actual de la novedad"
                    symbol={CurrencySymbol.COP}
                  />
                </div>
              )}
              {cryptoDebt && (
                <div className="flex flex-col gap-5">
                  <CurrencyInput
                    name="cryptoDebt.totalAmount"
                    label="Novedad total en criptomonedas"
                    placeholder="Valor total de la novedad"
                    symbol={CurrencySymbol.BUSD}
                  />
                  <CurrencyInput
                    name="cryptoDebt.currentAmount"
                    label="Novedad actual en criptomonedas"
                    placeholder="Valor actual de la novedad"
                    symbol={CurrencySymbol.BUSD}
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <SubmitButton type="submit">Guardar</SubmitButton>

              <Button
                href={`/admin/dashboard/debts/${companyDebt.id}`}
                variant={ButtonColorVariants.SECONDARY}
              >
                Cancelar
              </Button>
            </div>
          </ValidatedForm>
        </Box>
      </div>
    </Modal>
  )
}
