import type {
  PremiumAdvance,
  PremiumAdvanceBankAccount,
  PremiumAdvanceTax,
  RequestReason,
} from '@prisma/client'

import { format } from 'date-fns'

import { Box } from '~/components/Layout/Box'
import { parseDate } from '~/utils/formatDate'
import { AdvanceStatusPill } from '~/components/Pills/AdvanceStatusPill'
import { AdvanceSummaryItem } from './Advances/AdvanceSummaryItem'
import { BankAccountDataSummary } from './Advances/BankAccountDataSummary'
import { Fragment } from 'react'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'

export interface PremiumAdvanceSummaryProps {
  premiumAdvance: Pick<
    PremiumAdvance,
    'status' | 'totalAmount' | 'requestedAmount' | 'requestReasonDescription'
  > & {
    createdAt: string | Date
    bankAccountData?: PremiumAdvanceBankAccount | null
    requestReason?: Pick<RequestReason, 'name'> | null
    taxes: PremiumAdvanceTax[]
  }
  isAdmin?: boolean
}

export const PremiumAdvanceSummary = ({
  premiumAdvance,
  isAdmin = false,
}: PremiumAdvanceSummaryProps) => {
  const {
    createdAt,
    status,
    bankAccountData,
    totalAmount,
    taxes,
    requestedAmount,
    requestReason,
    requestReasonDescription,
  } = premiumAdvance

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

      <div className="h-[1px] w-full bg-gray-200" />

      <div className="py-4">
        <AdvanceSummaryItem
          label="Fecha de solicitud"
          value={format(parseDate(createdAt), 'dd/MM/yyyy')}
        />
      </div>

      <div className="h-[1px] w-full bg-gray-200" />

      {isAdmin && (requestReason || requestReasonDescription) && (
        <>
          <div className="py-4">
            {requestReason && (
              <AdvanceSummaryItem
                label="Motivo de solicitud"
                value={requestReason.name}
              />
            )}

            {requestReasonDescription && (
              <AdvanceSummaryItem
                label="Descripción del motivo"
                value={requestReasonDescription}
              />
            )}
          </div>
          <div className="h-[1px] w-full bg-gray-200" />
        </>
      )}

      {bankAccountData && (
        <>
          <BankAccountDataSummary bankAccountData={bankAccountData} />
          <div className="h-[1px] w-full bg-gray-200" />
        </>
      )}

      <div className="pb-4" />

      {requestedAmount && (
        <AdvanceSummaryItem
          label="Anticipo solicitado"
          value={formatMoney(requestedAmount, CurrencySymbol.COP)}
        />
      )}

      {taxes.map(({ id, name, value, description }) => (
        <Fragment key={id}>
          <AdvanceSummaryItem
            label={name}
            value={formatMoney(value, CurrencySymbol.COP)}
          />
          {isAdmin && description && (
            <span className="mb-2 ml-2 mt-[2px] block text-xs text-gray-600">
              {description}
            </span>
          )}
        </Fragment>
      ))}

      {totalAmount && (
        <>
          <div className=" my-4 h-[1px] w-full bg-gray-200" />

          <AdvanceSummaryItem
            label={
              <div className="font-semibold">Total a descontar de nómina</div>
            }
            value={
              <div className="font-semibold">
                {formatMoney(totalAmount, CurrencySymbol.COP)}
              </div>
            }
          />
        </>
      )}

      <div className="pb-4" />
    </Box>
  )
}
