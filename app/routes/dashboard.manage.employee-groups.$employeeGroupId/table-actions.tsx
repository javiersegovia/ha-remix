import type { Table } from '@tanstack/react-table'

import { FormSubactions } from './route'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'

export const TableActions = <TData extends unknown>({
  table,
}: {
  table: Table<TData>
}) => {
  return (
    <div className="flex h-20 items-center py-4">
      <input
        type="hidden"
        name="subaction"
        value={FormSubactions.REMOVE_EMPLOYEES}
      />

      {(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && (
        <Button
          type="submit"
          variant={ButtonColorVariants.SECONDARY}
          icon={ButtonIconVariants.DELETE}
          size="SM"
          className="w-auto"
        >
          Remover colaboradores
        </Button>
      )}
    </div>
  )
}
