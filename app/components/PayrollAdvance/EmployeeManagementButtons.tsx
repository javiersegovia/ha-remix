import type { PayrollAdvance } from '@prisma/client'
import { PayrollAdvanceStatus } from '@prisma/client'
import { Form, useTransition } from '@remix-run/react'
import { Button } from '../Button'

interface ManagementButtonsProps {
  payrollAdvance: Pick<PayrollAdvance, 'id' | 'status'>
}

const { REQUESTED, CANCELLED } = PayrollAdvanceStatus
export const EmployeeManagementButtons = ({
  payrollAdvance: { id, status },
}: ManagementButtonsProps) => {
  // todo Javier: add toast notification for success

  const transition = useTransition()
  const isSubmitting =
    transition.state === 'submitting' || transition.state === 'loading'

  return status === REQUESTED ? (
    <div className="ml-auto inline-flex gap-4">
      <Form method="put" action={`/dashboard/payroll-advances/${id}`}>
        <>
          <input type="hidden" name="subaction" value={CANCELLED} />
          <Button type="submit" variant="LIGHT" disabled={isSubmitting}>
            Cancelar
          </Button>
        </>
      </Form>
    </div>
  ) : null
}
