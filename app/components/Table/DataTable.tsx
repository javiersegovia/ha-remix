import type {
  ColumnDef,
  SortingState,
  Table as TTable,
} from '@tanstack/react-table'
import React, { useEffect } from 'react'
import type { PaginationProps } from '../Lists/Pagination'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useNavigation } from '@remix-run/react'

import { Pagination } from '../Lists/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/UI/Table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  className?: string
  tableActions?: (table: TTable<TData>) => JSX.Element
  pagination?: PaginationProps
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  tableActions,
  pagination,
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

  const navigation = useNavigation()

  useEffect(() => {
    if (navigation.state !== 'idle') {
      table.resetRowSelection()
    }
  }, [navigation.state, table])

  return (
    <div className={className}>
      {tableActions?.(table)}

      <div className={twMerge(clsx('rounded-3xl border bg-white p-3'))}>
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

        {pagination && (
          <div className="pb-5 pt-2">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}
