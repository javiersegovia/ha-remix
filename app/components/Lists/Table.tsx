import { Link } from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'

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
}

export const Table = ({ headings, rows, pagination }: TableProps) => {
  console.log({ pagination })

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {headings.map((heading, index) => (
                    <TableHeading
                      key={heading}
                      title={heading}
                      className="text-base"
                      isCentered={index !== 0}
                    />
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row) => (
                  <tr
                    key={row.rowId}
                    className={clsx('hover:bg-gray-100', {
                      'cursor-not-allowed bg-gray-200 hover:bg-gray-300':
                        row.isDisabled,
                    })}
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

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex w-full place-content-end items-center gap-3">
          {pagination.currentPage >= 2 && (
            <Link to={`?page=${pagination?.currentPage - 1}`}>
              <MdArrowBackIos />
            </Link>
          )}

          {Array.from(Array(pagination.totalPages)).map((_, index) => (
            <>
              {index + 1 === pagination?.currentPage ? (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-steelBlue-700 text-white">
                  {index + 1}
                </div>
              ) : (
                <Link
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-400"
                  to={`?page=${index + 1}`}
                >
                  {index + 1}
                </Link>
              )}
            </>
          ))}

          {pagination.currentPage < pagination.totalPages && (
            <Link to={`?page=${pagination?.currentPage + 1}`}>
              <MdArrowForwardIos />
            </Link>
          )}
        </div>
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
                isDisabled && 'pointer-events-none text-gray-400'
              )}
            >
              {index === 0 && href ? (
                <Link
                  to={href}
                  className={clsx(
                    'text-sm font-medium text-gray-900 underline hover:text-cyan-600',
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
