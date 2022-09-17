import type { PayrollAdvanceHistory } from '@prisma/client'
import { PayrollAdvanceStatus } from '@prisma/client'
import { formatRelative } from 'date-fns'
import { es } from 'date-fns/locale'
import { Box } from '~/components/Layout/Box'

export interface PayrollAdvanceHistoryItemProps {
  history: Pick<PayrollAdvanceHistory, 'toStatus'> & {
    createdAt: Date | string
  }
  historyActorName: string
}

const statusDescriptions = (name: string) => ({
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
    <>La solicitud de adelanto de nómina fue rechazada</>
  ),
})

export const PayrollAdvanceHistoryItem = ({
  history,
  historyActorName,
}: PayrollAdvanceHistoryItemProps) => {
  const dateRelative = formatRelative(
    Date.parse(`${history.createdAt}`),
    new Date(),
    { locale: es }
  )

  return (
    <Box className="p-4 text-sm text-gray-800">
      {statusDescriptions(historyActorName)[history.toStatus]}
      <p className="mt-2 text-xs italic text-gray-600">{dateRelative}</p>
    </Box>
  )
}
