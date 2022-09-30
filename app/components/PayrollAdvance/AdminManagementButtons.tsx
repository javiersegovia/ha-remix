import type { PayrollAdvance, PayrollAdvanceWallet } from '@prisma/client'

import { PayrollAdvancePaymentMethod } from '@prisma/client'
import { PayrollAdvanceStatus } from '@prisma/client'
import { Form, useTransition } from '@remix-run/react'
import { Button } from '../Button'

interface ManagementButtonsProps {
  payrollAdvance: Pick<
    PayrollAdvance,
    'id' | 'status' | 'paymentMethod' | 'totalAmount'
  > & {
    walletData?: Pick<PayrollAdvanceWallet, 'address'> | null
  }
}

const { REQUESTED, APPROVED, DENIED, PAID } = PayrollAdvanceStatus
const { WALLET } = PayrollAdvancePaymentMethod

export const AdminManagementButtons = ({
  payrollAdvance: { id, status, paymentMethod, walletData, totalAmount },
}: ManagementButtonsProps) => {
  // todo Javier: add toast notification for success

  const transition = useTransition()
  const isSubmitting = transition.state !== 'idle'

  return (
    <div className="ml-auto inline-flex gap-4">
      {/* We group together those two status to avoid a button jumping when changing states and refreshing the page */}
      {(status === REQUESTED || status === APPROVED) && (
        <Form method="put" action={`/admin/dashboard/payroll-advances/${id}`}>
          <>
            <input
              type="hidden"
              name="subaction"
              value={status === REQUESTED ? APPROVED : PAID}
            />
            <Button
              type="submit"
              className="whitespace-nowrap"
              disabled={isSubmitting}
            >
              {status === REQUESTED && 'Aprobar'}
              {status === APPROVED && 'Marcar como pagado'}
            </Button>
          </>
        </Form>
      )}

      {status === APPROVED && paymentMethod === WALLET && (
        <Button
          // onClick={handleBUSDTransfer} // TODO Setup MetaMask payment with useHydrated in order to disable it when not using JS
          type="button"
          disabled={isSubmitting}
          onClick={() => alert('To do: Handle MetaMask payment')}
          className="whitespace-nowrap"
        >
          Pagar con MetaMask
        </Button>
      )}

      {(status == REQUESTED || status == APPROVED) && (
        <Form method="put" action={`/admin/dashboard/payroll-advances/${id}`}>
          <>
            <input type="hidden" name="subaction" value={DENIED} />
            <Button type="submit" variant="LIGHT" disabled={isSubmitting}>
              Denegar
            </Button>
          </>
        </Form>
      )}
    </div>
  )
}
