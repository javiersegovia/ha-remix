import { Link } from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'
import { Pagination } from './Pagination'
import { twMerge } from 'tailwind-merge'

export interface TableRowProps {
  rowId: string | number
  items: React.ReactNode[] | string[]
  href?: string
  isDisabled?: boolean
}

export interface TableProps {
  headings: string[]
  rows: TableRowProps[]
  pagination?: {
    totalPages: number
    currentPage: number
  }
  classNames?: {
    heading?: string
    row?: string
  }
}

export const Table = ({
  headings,
  rows,
  pagination,
  classNames,
}: TableProps) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-[20px]">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-white">
                <tr className="bg-white">
                  {headings.map((heading, index) => (
                    <TableHeading
                      key={heading}
                      title={heading}
                      className={classNames?.heading}
                      isCentered={index !== 0}
                    />
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row) => (
                  <tr
                    key={row.rowId}
                    className={twMerge(
                      clsx(
                        'hover:bg-gray-100',
                        {
                          'cursor-not-allowed bg-gray-200 hover:bg-gray-300':
                            row.isDisabled,
                        },
                        classNames?.row
                      )
                    )}
                  >
                    <TableRow
                      rowId={row.rowId}
                      items={row.items}
                      href={row.href}
                      isDisabled={row.isDisabled}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pagination && (
        <Pagination
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
        />
      )}
    </div>
  )
}

export const TableRow = ({ rowId, href, items, isDisabled }: TableRowProps) => {
  return (
    <>
      {items.map((item, index) => {
        return (
          <TableData key={`${rowId}_${index}`} isCentered={index !== 0}>
            <div
              className={clsx(
                'text-sm',
                isDisabled && 'pointer-events-none text-gray-400'
              )}
            >
              {index === 0 && href ? (
                <Link
                  to={href}
                  className={clsx(
                    'font-medium text-gray-900 hover:text-cyan-600',
                    isDisabled && 'text-gray-400'
                  )}
                >
                  {item}
                </Link>
              ) : (
                item
              )}
            </div>
          </TableData>
        )
      })}
    </>
  )
}
