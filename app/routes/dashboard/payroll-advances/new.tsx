import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from '@remix-run/server-runtime'

import { useEffect, useRef } from 'react'
import {
  useControlField,
  ValidatedForm,
  validationError,
} from 'remix-validated-form'
import { useActionData, useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { PayrollAdvanceAvailableAmount } from '~/containers/dashboard/PayrollAdvanceAvailableAmount'
import { Box } from '~/components/Layout/Box'
import {
  CompanyStatus,
  EmployeeStatus,
  PayrollAdvancePaymentMethod,
} from '@prisma/client'
import {
  CurrencyInput,
  CurrencySymbol,
} from '~/components/FormFields/CurrencyInput'
import { Select } from '~/components/FormFields/Select'
import { calculatePayrollValidator } from '~/schemas/calculate-payroll.schema'
import { SubmitButton } from '~/components/SubmitButton'
import { getEmployeePaymentOptions } from '~/services/employee/employee.server'
import {
  calculatePayrollAdvance,
  createPayrollAdvance,
  getPayrollAdvanceRequestReasons,
} from '~/services/payroll-advance/payroll-advance.server'
import { PayrollAdvanceCalculation } from '~/containers/dashboard/PayrollAdvanceCalculation'
import { Input } from '~/components/FormFields/Input'

type LoaderData = {
  employee: Awaited<ReturnType<typeof requireEmployee>>
  paymentOptions: Awaited<ReturnType<typeof getEmployeePaymentOptions>>
  requestReasons: Awaited<ReturnType<typeof getPayrollAdvanceRequestReasons>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const employee = await requireEmployee(request)

  const paymentOptions = getEmployeePaymentOptions({
    employee,
    wallet: employee.wallet,
    bankAccount: employee.bankAccount,
  })

  return json<LoaderData>({
    employee,
    paymentOptions,
    requestReasons: await getPayrollAdvanceRequestReasons(),
  })
}

type ActionData = {
  calculation:
    | Awaited<ReturnType<typeof calculatePayrollAdvance>>['data']
    | null
}

/** The "calculation" process could be handled inside the loader as a "GET" requested,
 *  but in order to return validation errors inside the form, we have to use actions,
 *  as Remix Validated Form does not handle the errors inside the loaderData.
 */
export const action: ActionFunction = async ({ request }) => {
  const employee = await requireEmployee(request)

  const formData = await request.formData()
  const subaction = formData.get('subaction')
  let calculation = null

  const { data, submittedData, error, formId } =
    await calculatePayrollValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  if (subaction === 'calculate') {
    const { data: calculationData, fieldErrors } =
      await calculatePayrollAdvance({
        employee,
        requestedAmount: data.requestedAmount,
        paymentMethod: data.paymentMethod,
        requestReasonId: data.requestReasonId,
        requestReasonDescription: data.requestReasonDescription,
      })

    if (fieldErrors) {
      return validationError(
        {
          fieldErrors,
          formId,
        },
        submittedData
      )
    }

    calculation = calculationData
  } else if (subaction === 'request') {
    const payrollResult = await createPayrollAdvance({
      data,
      employeeId: employee.id,
      companyId: employee.companyId,
    })

    if ('fieldErrors' in payrollResult) {
      return validationError({ fieldErrors: payrollResult.fieldErrors, formId })
    }

    return redirect(`/dashboard/payroll-advances/${payrollResult.id}`)
  }

  return json<ActionData>({
    calculation,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Solicitar adelanto de nómina | HoyAdelantas',
  }
}

const calculationFormId = 'CalculationForm'
export default function PayrollAdvanceNewRoute() {
  const { employee, paymentOptions, requestReasons } =
    useLoaderData<LoaderData>()
  const { calculation } = useActionData<ActionData>() || {}

  const calculationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (calculation && calculationRef.current) {
      calculationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [calculation])

  const fiatAvailableAmount = employee.advanceAvailableAmount || 0
  const cryptoAvailableAmount = employee.advanceCryptoAvailableAmount || 0
  const hasAnAvailableAmount =
    fiatAvailableAmount > 0 || cryptoAvailableAmount > 0
  const hasAvailableBothAmounts =
    fiatAvailableAmount > 0 && cryptoAvailableAmount > 0
  const hasActiveAccount = employee.status === EmployeeStatus.ACTIVE
  const hasActiveCompany = employee.company.status === CompanyStatus.ACTIVE

  const [paymentMethod] = useControlField<string | undefined>(
    'paymentMethod',
    calculationFormId
  )

  const currencySymbol =
    paymentMethod === PayrollAdvancePaymentMethod.BANK_ACCOUNT
      ? CurrencySymbol.COP
      : paymentMethod === PayrollAdvancePaymentMethod.WALLET
      ? CurrencySymbol.BUSD
      : undefined

  return (
    <>
      <div className="mx-auto mt-10 w-full max-w-screen-lg px-2 sm:px-8">
        <section className="flex flex-col gap-6 xl:flex-row">
          <div className="mx-auto w-full max-w-lg">
            <Title as="h1" className="text-center xl:text-left">
              Calcula tu próximo adelanto
            </Title>
            <Box className="mt-8 block p-6">
              <PayrollAdvanceAvailableAmount
                hasActiveAccount={hasActiveAccount}
                hasActiveCompany={hasActiveCompany}
                hasAnAvailableAmount={hasAnAvailableAmount}
                hasAvailableBothAmounts={hasAvailableBothAmounts}
                fiatAvailableAmount={employee.advanceAvailableAmount || 0}
                cryptoAvailableAmount={cryptoAvailableAmount}
              />
              <ValidatedForm
                className="space-y-6"
                method="post"
                id={calculationFormId}
                validator={calculatePayrollValidator}
                subaction="calculate"
                autoComplete="off"
              >
                <div>
                  <CurrencyInput
                    name="requestedAmount"
                    label="¿Cuánto deseas adelantar?"
                    placeholder="Monto a solicitar"
                    symbol={currencySymbol}
                  />
                </div>
                <div>
                  <Select
                    name="paymentMethod"
                    label="Método de pago"
                    placeholder="Metodo de pago para recibir el adelanto"
                    options={paymentOptions}
                  />
                </div>

                <div>
                  <Select
                    name="requestReasonId"
                    label="Motivo"
                    placeholder="¿Para qué deseas el adelanto de nómina?"
                    options={requestReasons}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    name="requestReasonDescription"
                    label="¿En qué lo vas a usar?"
                    placeholder="Describe tu motivo aquí"
                  />
                </div>
                <SubmitButton variant={!calculation ? 'PRIMARY' : 'LIGHT'}>
                  Calcular
                </SubmitButton>
              </ValidatedForm>
            </Box>
          </div>

          {calculation && (
            <div
              className="mx-auto mb-8 w-full max-w-lg xl:mt-8"
              ref={calculationRef}
            >
              <PayrollAdvanceCalculation calculation={calculation} />
            </div>
          )}
        </section>
      </div>
    </>
  )
}
