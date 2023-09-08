import type { PointTransaction, PointTransactionType } from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'
import type { Nullable } from 'vitest'

import { TableSortableButton } from '~/components/UI/Table'
import { formatDate, sanitizeDate } from '~/utils/formatDate'

const pointTransactionTypeDescriptions: Record<PointTransactionType, string> = {
  TRANSFER: 'Transferencia',
  CONSUMPTION: 'Consumo',
  MODIFICATION: 'Modificación',
  REWARD: 'Recompensa',
}

export type PointTransactionDataItem = Pick<
  PointTransaction,
  'id' | 'value' | 'type'
> & {
  createdAt: string

  sender?: Nullable<{
    user: {
      fullName: string
      email: string
    }
  }>

  receiver?: Nullable<{
    user: {
      fullName: string
      email: string
    }
  }>
}

export const columns: ColumnDef<PointTransactionDataItem>[] = [
  {
    id: 'type',
    header: ({ column }) => {
      return (
        <TableSortableButton
          title="Tipo de transacción"
          column={column}
          className="mx-0"
        />
      )
    },
    accessorKey: 'type',
    cell: (props) => {
      const item = props.row.original
      return <>{pointTransactionTypeDescriptions[item.type]}</>
    },
  },
  {
    accessorKey: 'value',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Valor" column={column} />
    },
  },
  {
    accessorKey: 'sender.id',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Emisor" column={column} />
    },
    cell: (props) => {
      const item = props.row.original
      return <>{item.sender?.user.fullName}</>
    },
  },
  {
    accessorKey: 'receiver.id',
    sortingFn: 'alphanumeric',
    header: ({ column }) => {
      return <TableSortableButton title="Receptor" column={column} />
    },
    cell: (props) => {
      const item = props.row.original
      return <>{item.receiver?.user.fullName}</>
    },
  },

  {
    accessorKey: 'createdAt',
    sortingFn: 'datetime',
    header: ({ column }) => {
      return <TableSortableButton title="Fecha" column={column} />
    },
    cell: (props) => (
      <>
        {formatDate(
          sanitizeDate(new Date(Date.parse(props.getValue<string>()))) as Date
        )}
      </>
    ),
  },
]
