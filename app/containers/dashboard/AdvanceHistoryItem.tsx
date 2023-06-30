import { PremiumAdvanceStatus, PayrollAdvanceStatus } from '@prisma/client'
import { formatRelative } from 'date-fns'
import { es } from 'date-fns/locale'
import { Box } from '~/components/Layout/Box'

const payrollAdvanceStatusDescriptions = (name: string) => ({
  [PayrollAdvanceStatus.REQUESTED]: (
    <span>
      <strong>{name}</strong> solicitó un adelanto de nómina
    </span>
  ),

  [PayrollAdvanceStatus.APPROVED]: (
    <span>La solicitud de adelanto de nómina fue aprobada</span>
  ),

  [PayrollAdvanceStatus.PAID]: (
    <span>El pago se realizó satisfactoriamente</span>
  ),

  [PayrollAdvanceStatus.CANCELLED]: (
    <>
      <strong>{name}</strong> canceló la solicitud de adelanto de nómina
    </>
  ),

  [PayrollAdvanceStatus.DENIED]: (
    <>La solicitud de adelanto de nómina fue denegada</>
  ),
})

const premiumAdvanceStatusDescriptions = (name: string) => ({
  [PremiumAdvanceStatus.REQUESTED]: (
    <span>
      <strong>{name}</strong> solicitó un adelanto de prima
    </span>
  ),

  [PremiumAdvanceStatus.APPROVED]: (
    <span>La solicitud de adelanto de prima fue aprobada</span>
  ),

  [PremiumAdvanceStatus.PAID]: (
    <span>El pago se realizó satisfactoriamente</span>
  ),

  [PremiumAdvanceStatus.CANCELLED]: (
    <>
      <strong>{name}</strong> canceló la solicitud de adelanto de prima
    </>
  ),

  [PremiumAdvanceStatus.DENIED]: (
    <>La solicitud de adelanto de prima fue denegada</>
  ),
})

interface AdvanceHistoryCommonProps {
  historyActorName: string
  history: {
    createdAt: Date | string
  }
}

export type PayrollAdvanceHistoryItemProps = {
  type: 'PREMIUM_ADVANCE'
  history: {
    toStatus: PremiumAdvanceStatus
  }
} & AdvanceHistoryCommonProps

export type PremiumAdvanceHistoryItemProps = {
  type: 'PAYROLL_ADVANCE'
  history: {
    toStatus: PremiumAdvanceStatus
  }
} & AdvanceHistoryCommonProps

export const AdvanceHistoryItem = ({
  type,
  history,
  historyActorName,
}: PayrollAdvanceHistoryItemProps | PremiumAdvanceHistoryItemProps) => {
  const dateRelative = formatRelative(
    Date.parse(`${history.createdAt}`),
    new Date(),
    { locale: es }
  )

  const getter =
    type === 'PAYROLL_ADVANCE'
      ? payrollAdvanceStatusDescriptions
      : premiumAdvanceStatusDescriptions

  return (
    <Box className="p-4 text-sm text-gray-800">
      {getter(historyActorName)[history.toStatus]}
      <p className="mt-2 text-xs italic text-gray-600">{dateRelative}</p>
    </Box>
  )
}
