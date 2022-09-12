import { Link } from '@remix-run/react'

import clsx from 'clsx'
import type { getEmployeesByCompanyId } from '~/services/employee/employee.server'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { formatMoney } from '~/utils/formatMoney'

import { TableHeading } from './TableHeading'
import { TableData } from './TableData'
import { EmployeeStatusPill } from '../Pills/EmployeeStatusPill'

interface EmployeeListProps {
  employees: Awaited<ReturnType<typeof getEmployeesByCompanyId>>
}

export function EmployeeList({ employees }: EmployeeListProps) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Nombre completo" />
                  <TableHeading title="Cupo aprobado" isCentered />
                  <TableHeading title="Cupo disponible" isCentered />
                  <TableHeading title="Estado" isCentered />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.map((employee) => (
                  <tr key={employee.user.email} className="hover:bg-gray-100">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link to={employee.id}>
                        <div className="text-sm font-medium text-gray-900 underline hover:text-cyan-600">
                          {`${employee.user.firstName} ${employee.user.lastName}`}
                        </div>

                        <div className="text-sm text-gray-500">
                          {employee.user.email}
                        </div>
                      </Link>
                    </td>

                    <TableData isCentered>
                      {employee.advanceMaxAmount > 0 && (
                        <div className="text-sm text-gray-900">
                          {formatMoney(
                            employee.advanceMaxAmount,
                            CurrencySymbol.COP
                          )}
                        </div>
                      )}

                      {!!employee.advanceCryptoMaxAmount &&
                        employee.advanceCryptoMaxAmount > 0 && (
                          <div className="text-sm text-gray-900">
                            {formatMoney(
                              employee.advanceCryptoMaxAmount,
                              CurrencySymbol.BUSD
                            )}
                          </div>
                        )}

                      {!employee.advanceMaxAmount &&
                        !employee.advanceCryptoMaxAmount &&
                        '-'}
                    </TableData>

                    <TableData isCentered>
                      {employee.advanceMaxAmount > 0 && (
                        <div
                          className={clsx(
                            'text-sm text-gray-900',
                            (!employee.advanceAvailableAmount ||
                              employee.advanceAvailableAmount <= 0) &&
                              'text-red-500'
                          )}
                        >
                          {formatMoney(employee.advanceAvailableAmount)}
                        </div>
                      )}

                      {!!employee.advanceCryptoMaxAmount &&
                        employee.advanceCryptoMaxAmount > 0 && (
                          <div
                            className={clsx(
                              'text-sm text-gray-900',
                              (!employee.advanceCryptoAvailableAmount ||
                                employee.advanceCryptoAvailableAmount <= 0) &&
                                'text-red-500'
                            )}
                          >
                            {formatMoney(
                              employee.advanceCryptoAvailableAmount || 0,
                              CurrencySymbol.BUSD
                            )}
                          </div>
                        )}

                      {!employee.advanceAvailableAmount &&
                        !employee.advanceCryptoAvailableAmount &&
                        '-'}
                    </TableData>

                    <TableData isCentered>
                      <EmployeeStatusPill employeeStatus={employee.status} />
                    </TableData>
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
