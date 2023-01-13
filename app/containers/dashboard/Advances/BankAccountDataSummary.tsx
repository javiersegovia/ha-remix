import type {
  PayrollAdvanceBankAccount,
  PremiumAdvanceBankAccount,
} from '@prisma/client'
import { AdvanceSummaryItem } from './AdvanceSummaryItem'

export interface BankAccountDataSummaryProps {
  bankAccountData: Pick<
    PayrollAdvanceBankAccount | PremiumAdvanceBankAccount,
    | 'currencyName'
    | 'accountNumber'
    | 'accountType'
    | 'bankName'
    | 'identityDocumentType'
    | 'identityDocumentValue'
  >
}

export const BankAccountDataSummary = ({
  bankAccountData,
}: BankAccountDataSummaryProps) => {
  const {
    currencyName,
    accountNumber,
    accountType,
    bankName,
    identityDocumentType,
    identityDocumentValue,
  } = bankAccountData

  return (
    <div className="space-y-1 py-4">
      {currencyName && (
        <AdvanceSummaryItem label="Moneda" value={currencyName} />
      )}

      <AdvanceSummaryItem label="Número de cuenta" value={`${accountNumber}`} />

      <AdvanceSummaryItem label="Tipo de cuenta" value={accountType} />

      <AdvanceSummaryItem label="Banco" value={bankName} />

      <AdvanceSummaryItem
        label="Tipo de documento"
        value={identityDocumentType}
      />

      <AdvanceSummaryItem label="Documento" value={identityDocumentValue} />
    </div>
  )
}
