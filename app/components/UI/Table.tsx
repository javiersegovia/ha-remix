import type { Column } from '@tanstack/react-table'
import * as React from 'react'
import clsx from 'classnames'
import { twMerge } from 'tailwind-merge'
import {
  LuArrowDownUp,
  LuArrowDownWideNarrow,
  LuArrowUpNarrowWide,
} from 'react-icons/lu'

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={twMerge(clsx('w-full caption-bottom text-sm', className))}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={twMerge(clsx('[&_tr]:border-b', className))}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={twMerge(clsx('[&_tr:last-child]:border-0', className))}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={twMerge(clsx('font-medium text-black', className))}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={twMerge(
      clsx(
        'hover:bg-muted/50 data-[state=selected]:bg-muted bg-white transition-colors hover:bg-gray-100',
        className
      )
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={twMerge(
      clsx(
        'text-muted-foreground h-12 px-4 text-left align-middle text-base font-medium [&:has([role=checkbox])]:pr-0',
        className
      )
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={twMerge(
      clsx('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={twMerge(clsx('text-muted-foreground mt-4 text-sm', className))}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export function TableSortableButton<TData extends unknown>({
  title,
  column,
}: {
  title: string
  column: Column<TData>
}) {
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className={clsx('flex', column.getIsSorted() && 'text-steelBlue-600')}
    >
      {title}
      <span className="ml-2 mt-[5px] h-4 w-4 text-sm">
        {column.getIsSorted() === 'asc' && <LuArrowUpNarrowWide />}
        {!column.getIsSorted() && <LuArrowDownUp />}
        {column.getIsSorted() === 'desc' && <LuArrowDownWideNarrow />}
      </span>
    </button>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
