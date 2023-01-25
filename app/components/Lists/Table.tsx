import { Link } from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

export interface TableRowProps {
  key: string | number
  items: React.ReactNode[] | string[]
  href?: string
  isDisabled?: boolean
}

export interface TableProps {
  headings: string[]
  rows: TableRowProps[]
}

export const Table = ({ headings, rows }: TableProps) => {
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
                      className="bg-white text-base text-steelBlue-600"
                      isCentered={index !== 0}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={clsx('hover:bg-gray-100', {
                      'cursor-not-allowed bg-gray-200 hover:bg-gray-300':
                        row.isDisabled,
                    })}
                  >
                    <TableRow
                      key={row.key}
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
    </div>
  )
}

export const TableRow = ({ key, href, items, isDisabled }: TableRowProps) => {
  return (
    <>
      {items.map((item, index) => {
        return (
          <TableData key={`${key}_${item}`} isCentered={index !== 0}>
            <span
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
            </span>
          </TableData>
        )
      })}
    </>
  )
}
