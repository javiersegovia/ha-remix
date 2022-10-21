import type { PremiumAdvance } from '@prisma/client'
import { PremiumAdvanceStatus } from '@prisma/client'
import { Form, useTransition } from '@remix-run/react'
import { Button } from '~/components/Button'

interface ManagementButtonsProps {
  premiumAdvance: Pick<PremiumAdvance, 'id' | 'status'>
}

const { REQUESTED, CANCELLED } = PremiumAdvanceStatus
export const EmployeeManagementButtons = ({
  premiumAdvance: { id, status },
}: ManagementButtonsProps) => {
  // todo Javier: add toast notification for success

  const transition = useTransition()
  const isSubmitting = transition.state !== 'idle'

  return status === REQUESTED ? (
    <div className="inline-flex w-full gap-4 md:ml-auto md:w-auto">
      <Form
        method="put"
        action={`/dashboard/premium-advances/${id}`}
        className="w-full"
      >
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
