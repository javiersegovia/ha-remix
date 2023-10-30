import type { IndicatorActivity } from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'

import { $path } from 'remix-routes'
import { TableSortableButton } from '~/components/UI/Table'
import { formatDate, sanitizeDate } from '~/utils/formatDate'
import { Button, ButtonColorVariants } from '~/components/Button'

export type ChallengeIndicatorActivityDataItem = Pick<
  IndicatorActivity,
  'id' | 'value'
> & {
  date: string
}

export const indicatorActivityColumns: ColumnDef<ChallengeIndicatorActivityDataItem>[] =
  [
    {
      accessorKey: 'value',
      sortingFn: 'alphanumeric',
      header: ({ column }) => {
        return (
          <TableSortableButton title="Valor" className="mx-0" column={column} />
        )
      },
      cell: (props) => <>{props.renderValue<number>().toLocaleString()}</>,
    },
    {
      accessorKey: 'date',
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

export const fullIndicatorActivityColumns: ColumnDef<ChallengeIndicatorActivityDataItem>[] =
  [
    ...indicatorActivityColumns,
    {
      accessorKey: 'id',
      header: '',
      cell: (props) => {
        const item = props.row.original

        return (
          <>
            <Button
              href={$path('/activity/indicators/:indicatorActivityId', {
                indicatorActivityId: item.id,
              })}
              size="XS"
              className="ml-auto w-auto"
              variant={ButtonColorVariants.SECONDARY}
            >
              Editar
            </Button>
          </>
        )
      },
    },
  ]
