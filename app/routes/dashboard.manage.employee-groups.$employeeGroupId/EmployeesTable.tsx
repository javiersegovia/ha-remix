import React, { useEffect } from 'react'

import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/UI/Table'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Form } from '@remix-run/react'
import { FormSubactions } from './route'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
}

export function EmployeesTable<TData, TValue>({
  columns,
  data,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  useEffect(() => {
    table.resetRowSelection()
  }, [table, data])

  return (
    <div>
      <Form method="DELETE">
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
        <div
          className={twMerge(
            clsx('rounded-3xl border bg-white p-3', className)
          )}
        >
          <Table>
            <TableHeader className="overflow-hidden">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={clsx(
                      idx % 2 && 'rounded-3xl bg-gray-50 hover:bg-gray-100',
                      row.getIsSelected() &&
                        'bg-steelBlue-300 hover:bg-steelBlue-300'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Form>
    </div>
  )
}
