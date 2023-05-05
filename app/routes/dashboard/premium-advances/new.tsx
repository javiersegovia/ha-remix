import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import type { CalculatePremiumAdvanceSchemaInput } from '~/schemas/calculate-premium-advance.schema'
import type { ITaxItem } from '~/services/payroll-advance/payroll-advance.interface'

import { useEffect, useRef } from 'react'
import { json, redirect } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { CompanyStatus, EmployeeStatus } from '@prisma/client'
import { useActionData, useLoaderData } from '@remix-run/react'

import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'

import { calculatePremiumAdvanceValidator } from '~/schemas/calculate-premium-advance.schema'
import { requireEmployee } from '~/session.server'
import {
  calculatePremiumAdvanceCost,
  calculatePremiumAdvanceSpecs,
  createPremiumAdvance,
  verifyIfEmployeeCanRequestPremiumAdvance,
} from '~/services/premium-advance/premium-advance.server'
import { ErrorText } from '~/components/Error/ErrorText'
import { Button, ButtonColorVariants } from '~/components/Button'
import { formatMoney } from '../../../utils/formatMoney'
import { getEmployeeEnabledBenefits } from '~/services/permissions/permissions.server'
import { getRequestReasons } from '~/services/payroll-advance/payroll-advance.server'
import { AdvanceTotalCost } from '~/containers/dashboard/Advances/AdvanceTotalCost'
import { hasSignedTerms } from '~/services/signature/signature.server'
import { RequestPremiumAdvanceForm } from '~/components/Forms/RequestPremiumAdvanceForm'

type PremiumAdvancesNewRouteLoaderData = {
  hasActiveAccount: boolean
  hasActiveCompany: boolean
  availableAmount: Awaited<
    ReturnType<typeof calculatePremiumAdvanceSpecs>
  >['availableAmount']
  requestReasons: Awaited<ReturnType<typeof getRequestReasons>>
}

type PremiumAdvancesNewRouteLoaderErrorData = {
  errorMessage: string | null
}

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const enabledBenefits = await getEmployeeEnabledBenefits(employee.userId)

  const { errorMessage, canUsePremiumAdvances } =
    verifyIfEmployeeCanRequestPremiumAdvance({ employee, enabledBenefits })

  if (!canUsePremiumAdvances) {
    return redirect('/')
  }

  const employeeHasSignedTerms = await hasSignedTerms(employee.id)
  if (!employeeHasSignedTerms) {
    return redirect('/dashboard/verify-terms')
  }

  if (errorMessage) {
    return json<PremiumAdvancesNewRouteLoaderErrorData>({
      errorMessage,
    })
  }

  const { availableAmount } = await calculatePremiumAdvanceSpecs(employee.id)

  if (availableAmount <= 0) {
    return json<PremiumAdvancesNewRouteLoaderErrorData>({
      errorMessage:
        'No tienes cupo disponible en este momento. Intenta nuevamente en unos días.',
    })
  }

  return json<PremiumAdvancesNewRouteLoaderData>({
    hasActiveAccount: employee.status === EmployeeStatus.ACTIVE,
    hasActiveCompany: employee.company.status === CompanyStatus.ACTIVE,
    availableAmount,
    requestReasons: await getRequestReasons(),
  })
}

type CalculatePremiumAdvanceActionData = {
  totalAmount: number
  taxItems: ITaxItem[]
  calculationData: CalculatePremiumAdvanceSchemaInput
}

export const CALCULATE_SUBACTION = 'calculate'
export const CREATE_PREMIUM_ADVANCE_SUBACTION = 'create_premium_advance'

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const enabledBenefits = await getEmployeeEnabledBenefits(employee.userId)

  const { errorMessage, canUsePremiumAdvances } =
    verifyIfEmployeeCanRequestPremiumAdvance({ employee, enabledBenefits })

  if (!canUsePremiumAdvances) {
    return redirect('/')
  }

  const employeeHasSignedTerms = await hasSignedTerms(employee.id)
  if (!employeeHasSignedTerms) {
    return redirect('/dashboard/verify-terms')
  }

  if (errorMessage) {
    return json<PremiumAdvancesNewRouteLoaderErrorData>({
      errorMessage,
    })
  }

  const formData = await request.formData()
  const subaction = formData.get('subaction')

  const { data, submittedData, error, formId } =
    await calculatePremiumAdvanceValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  if (subaction === CALCULATE_SUBACTION) {
    const { totalAmount, taxItems, fieldErrors } =
      await calculatePremiumAdvanceCost(data, employee.id)

    if (fieldErrors) {
      return validationError(
        {
          fieldErrors,
          formId,
        },
        submittedData
      )
    }

    return json<CalculatePremiumAdvanceActionData>({
      totalAmount,
      taxItems,
      calculationData: data,
    })
  } else if (subaction === CREATE_PREMIUM_ADVANCE_SUBACTION) {
    const { premiumAdvance, fieldErrors } = await createPremiumAdvance(
      data,
      employee.id
    )

    if (fieldErrors) {
      return validationError(
        {
          fieldErrors,
          formId,
        },
        submittedData
      )
    }

    return redirect(`/dashboard/premium-advances/${premiumAdvance.id}`)
  }
}

const PremiumAdvancesNewRoute = () => {
  const loaderData = useLoaderData<typeof loader>()

  const {
    totalAmount,
    taxItems = [],
    calculationData,
  } = useActionData<CalculatePremiumAdvanceActionData>() || {}

  const calculationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (totalAmount && calculationRef.current) {
      calculationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [totalAmount, taxItems])

  return (
    <>
      <div className="mx-auto mt-10 w-full max-w-screen-lg px-2 sm:px-8">
        <section className="flex flex-col gap-6 xl:flex-row">
          <div className="mx-auto w-full max-w-lg">
            <Title as="h1" className="text-center xl:text-left">
              Calcula tu próximo adelanto de prima
            </Title>
            <Box className="mt-8 block p-6">
              {'errorMessage' in loaderData ? (
                <>
                  <ErrorText>{loaderData.errorMessage}</ErrorText>
                  <Button
                    href="/"
                    variant={ButtonColorVariants.SECONDARY}
                    className="mt-5"
                  >
                    Regresar al inicio
                  </Button>
                </>
              ) : (
                <>
                  {Boolean(loaderData.availableAmount) && (
                    <section className="mb-8 text-center text-green-600">
                      <p className="text-base font-medium">Saldo disponible</p>
                      <p className="font-bold">
                        {formatMoney(loaderData.availableAmount)}
                      </p>
                    </section>
                  )}

                  <RequestPremiumAdvanceForm
                    requestReasons={loaderData.requestReasons}
                    hasCalculationData={Boolean(calculationData)}
                  />
                </>
              )}
            </Box>
          </div>

          {totalAmount && calculationData && (
            <div
              className="mx-auto mb-8 w-full max-w-lg xl:mt-8"
              ref={calculationRef}
            >
              <AdvanceTotalCost
                taxItems={taxItems}
                totalAmount={totalAmount}
                calculationData={calculationData}
                action="/dashboard/premium-advances/new"
              />
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default PremiumAdvancesNewRoute
