import type { PremiumAdvance } from '@prisma/client'

import { PremiumAdvanceStatus } from '@prisma/client'
import { Form, useNavigation } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'

interface ManagementButtonsProps {
  premiumAdvance: Pick<PremiumAdvance, 'id' | 'status'>
}

const { REQUESTED, APPROVED, DENIED, PAID } = PremiumAdvanceStatus

export const AdminManagementButtons = ({
  premiumAdvance: { id, status },
}: ManagementButtonsProps) => {
  // todo Javier: add toast notification for success

  const { state } = useNavigation()
  const isSubmitting = state !== 'idle'

  return (
    <div className="flex w-full flex-col justify-end gap-4 sm:flex-row">
      {/* We group together those two status to avoid a button jumping when changing states and refreshing the page */}
      {(status === REQUESTED || status === APPROVED) && (
        <Form method="put" action={`/admin/dashboard/premium-advances/${id}`}>
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

      {(status == REQUESTED || status == APPROVED) && (
        <Form method="put" action={`/admin/dashboard/premium-advances/${id}`}>
          <>
            <input type="hidden" name="subaction" value={DENIED} />
            <Button
              type="submit"
              variant={ButtonColorVariants.SECONDARY}
              disabled={isSubmitting}
            >
              Denegar
            </Button>
          </>
        </Form>
      )}
    </div>
  )
}
