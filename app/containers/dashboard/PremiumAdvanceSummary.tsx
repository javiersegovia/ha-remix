import type { PremiumAdvance } from '@prisma/client'

import { format } from 'date-fns'

import { Box } from '~/components/Layout/Box'
import { parseDate } from '~/utils/formatDate'
import { AdvanceStatusPill } from '~/components/Pills/AdvanceStatusPill'
import { PayrollAdvanceSummaryItem } from './PayrollAdvanceSummaryItem'

export interface PremiumAdvanceSummaryProps {
  premiumAdvance: Pick<PremiumAdvance, 'status'> & {
    createdAt: string | Date
  }
  isAdmin?: boolean
}

export const PremiumAdvanceSummary = ({
  premiumAdvance,
  isAdmin = false,
}: PremiumAdvanceSummaryProps) => {
  const { createdAt, status } = premiumAdvance

  return (
    <Box className="w-full p-6">
      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="inline-block text-right font-medium text-gray-700">
          Estado
        </p>

        <p className="font-medium">
          <AdvanceStatusPill status={status} />
        </p>
      </div>

      {createdAt && (
        <>
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="py-4">
            <PayrollAdvanceSummaryItem
              label="Fecha de solicitud"
              value={format(parseDate(createdAt), 'dd/MM/yyyy')}
            />
          </div>
        </>
      )}

      <div className="pb-4" />
    </Box>
  )
}
