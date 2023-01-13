import type {
  PayrollAdvance,
  RequestReason,
  PayrollAdvanceTax,
  PayrollAdvanceTransfer,
  PayrollAdvanceWallet,
} from '@prisma/client'

import {
  PayrollAdvancePaymentMethod,
  PayrollAdvanceStatus,
  PayrollAdvanceTransferStatus,
} from '@prisma/client'
import { format } from 'date-fns'
import { Fragment } from 'react'

import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { Box } from '~/components/Layout/Box'
import { contractAddresses } from '~/services/blockchain/data'
import { parseDate } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { AdvanceSummaryItem } from './Advances/AdvanceSummaryItem'
import { AdvanceStatusPill } from '~/components/Pills/AdvanceStatusPill'
import type { BankAccountDataSummaryProps } from './Advances/BankAccountDataSummary'
import { BankAccountDataSummary } from './Advances/BankAccountDataSummary'

interface WalletDataSummaryProps {
  walletData: Pick<
    PayrollAdvanceWallet,
    | 'cryptocurrencyName'
    | 'cryptoNetworkName'
    | 'cryptocurrencyAcronym'
    | 'address'
    | 'cryptoNetworkIdNumber'
  >
}

const WalletDataSummary = ({ walletData }: WalletDataSummaryProps) => {
  const {
    cryptocurrencyName,
    cryptocurrencyAcronym,
    cryptoNetworkName,
    address,
  } = walletData

  return (
    <div className="space-y-1 py-4">
      <AdvanceSummaryItem
        label="Criptomoneda"
        value={`${cryptocurrencyName} (${cryptocurrencyAcronym})`}
      />
      <AdvanceSummaryItem label="Red" value={cryptoNetworkName} />
      <AdvanceSummaryItem label="Billetera cripto" value={address} />
    </div>
  )
}

export interface PayrollAdvanceSummaryProps {
  payrollAdvance: Pick<
    PayrollAdvance,
    | 'paymentMethod'
    | 'totalAmount'
    | 'requestedAmount'
    | 'status'
    | 'requestReasonDescription'
  > & {
    bankAccountData?: BankAccountDataSummaryProps['bankAccountData'] | null
    walletData?: WalletDataSummaryProps['walletData'] | null
    taxes: Pick<PayrollAdvanceTax, 'id' | 'name' | 'description' | 'value'>[]
    transfers: Pick<PayrollAdvanceTransfer, 'status' | 'transactionHash'>[]
    createdAt: string | Date
    requestReason?: Pick<RequestReason, 'name'> | null
  }
  isAdmin?: boolean
}

export const PayrollAdvanceSummary = ({
  payrollAdvance,
  isAdmin = false,
}: PayrollAdvanceSummaryProps) => {
  const {
    paymentMethod,
    walletData,
    bankAccountData,
    createdAt,
    totalAmount,
    requestedAmount,
    status,
    transfers,
    requestReason,
    requestReasonDescription,
  } = payrollAdvance

  const currencySymbol =
    paymentMethod === PayrollAdvancePaymentMethod.BANK_ACCOUNT
      ? CurrencySymbol.COP
      : CurrencySymbol.BUSD

  const hasBeenPaid = status === PayrollAdvanceStatus.PAID

  // const {
  //   data: estimatedGas,
  //   isLoading: isLoadingGasFee,
  //   estimatedGasFormatted,
  // } = useEstimatedGasFeeQuery({
  //   address: !hasBeenPaid ? walletData?.address : undefined,
  //   requestedAmount,
  // })

  // const estimatedGasValue = isLoadingGasFee
  //   ? 'Calculando...'
  //   : estimatedGasFormatted || <span className="text-red-500">Error</span>

  // const totalCost =
  //   walletData?.address &&
  //   estimatedGas &&
  //   paymentMethod === PayrollAdvancePaymentMethod.WALLET &&
  //   !hasBeenPaid
  //     ? totalAmount + Number(estimatedGas)
  //     : totalAmount
  const totalCost = totalAmount

  const successfulTransfer = transfers.find(
    (transferItem) =>
      transferItem.status === PayrollAdvanceTransferStatus.SUCCESS
  )

  const blockExplorerUrl =
    walletData &&
    contractAddresses[walletData?.cryptoNetworkIdNumber]?.busd?.blockExplorer

  return (
    <Box className="w-full p-6">
      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="inline-block text-right font-medium text-gray-700">
          Estado
        </p>

        <p className="font-medium">
          <AdvanceStatusPill status={payrollAdvance.status} />
        </p>
      </div>

      {createdAt && (
        <>
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="py-4">
            <AdvanceSummaryItem
              label="Fecha de solicitud"
              value={format(parseDate(createdAt), 'dd/MM/yyyy')}
            />
          </div>
        </>
      )}

      {isAdmin && (requestReason || requestReasonDescription) && (
        <>
          <div className="h-[1px] w-full bg-gray-200" />
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
        </>
      )}

      <div className="h-[1px] w-full bg-gray-200" />

      {walletData ? (
        <>
          <WalletDataSummary walletData={walletData} />
          <div className="h-[1px] w-full bg-gray-200" />
        </>
      ) : (
        bankAccountData && (
          <>
            <BankAccountDataSummary bankAccountData={bankAccountData} />
            <div className="h-[1px] w-full bg-gray-200" />
          </>
        )
      )}

      <div className="pb-4" />

      <AdvanceSummaryItem
        label="Anticipo solicitado"
        value={formatMoney(requestedAmount, currencySymbol)}
      />

      {payrollAdvance.taxes.map(({ id, name, value, description }) => (
        <Fragment key={id}>
          <AdvanceSummaryItem
            label={name}
            value={formatMoney(value, currencySymbol)}
          />
          {isAdmin && description && (
            <span className="mt-[2px] mb-2 ml-2 block text-xs text-gray-600">
              {description}
            </span>
          )}
        </Fragment>
      ))}

      {/* {paymentMethod === PayrollAdvancePaymentMethod.WALLET &&
        walletData?.address && (
          <AdvanceSummaryItem
            label={
              !hasBeenPaid
                ? 'Costo aproximado de transferencia (*)'
                : 'Costo de transferencia'
            }
            value={
              !hasBeenPaid
                ? estimatedGasValue
                : formatMoney(
                    (payroll.totalAmount - payroll.requestedAmount).toFixed(2),
                    currencySymbol
                  )
            }
          />
        )} */}

      <AdvanceSummaryItem
        label={<div className="font-semibold">Total a descontar de nómina</div>}
        value={
          <div className="font-semibold">
            {formatMoney(totalCost, currencySymbol)}
          </div>
        }
      />

      {paymentMethod === PayrollAdvancePaymentMethod.WALLET &&
        walletData?.address &&
        !hasBeenPaid && (
          <>
            <div className="height[1px] my-4 w-full bg-gray-200" />

            <p className="text-justify text-xs text-gray-700">
              (*) El costo de la transferencia puede variar y será calculado en
              el momento en el que el pago sea efectuado. Al realizar la
              solicitud, aceptas una posible diferencia en el costo de
              transferencia, y por ende, en el monto total a descontar.
            </p>
          </>
        )}

      {successfulTransfer && blockExplorerUrl && (
        <>
          <div className="height[1px] my-4 w-full bg-gray-200" />

          <div className="flex">
            <a
              className="cursor-pointer text-justify text-xs text-cyan-600 underline"
              href={`${blockExplorerUrl}tx/${successfulTransfer.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver detalles de la transacción
            </a>
          </div>
        </>
      )}
    </Box>
  )
}
