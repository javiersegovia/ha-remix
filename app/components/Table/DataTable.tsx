import type {
  ColumnDef,
  SortingState,
  Table as TTable,
} from '@tanstack/react-table'
import React, { useEffect } from 'react'

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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  tableActions?: React.ComponentType<{ table: TTable<TData> }>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  tableActions: TableActions,
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
      {TableActions && <TableActions table={table} />}

      <div
        className={twMerge(clsx('rounded-3xl border bg-white p-3', className))}
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
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
