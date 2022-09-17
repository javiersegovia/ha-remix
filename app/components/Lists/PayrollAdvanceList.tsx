import { PayrollAdvancePaymentMethod } from '@prisma/client'
import { Link } from '@remix-run/react'
import { formatDate } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '../FormFields/CurrencyInput'
import { PayrollAdvanceStatusPill } from '../Pills/PayrollAdvanceStatusPill'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

import type { Company, PayrollAdvance, User } from '@prisma/client'

export interface PayrollAdvanceListProps {
  payrollAdvances: (Pick<
    PayrollAdvance,
    | 'id'
    | 'requestedAmount'
    | 'paymentMethod'
    | 'totalAmount'
    | 'requestedAmount'
    | 'status'
  > & {
    createdAt: string | Date
    company: Pick<Company, 'name'>
    employee?: {
      user: Pick<User, 'firstName' | 'lastName'> | null
    } | null
  })[]
  isAdmin?: boolean
  hideColumns?: {
    status: boolean
  }
}

interface EmployeeNameProps {
  employee: any
  companyName: string
}

const EmployeeNameTitle = ({ employee, companyName }: EmployeeNameProps) => {
  return (
    <>
      {(employee.user.firstName || employee.user.lastName) && (
        <div className="text-sm font-medium text-cyan-600 underline hover:text-cyan-800">
          {`${employee.user.firstName} ${employee.user.lastName}`.trim()}
        </div>
      )}
      <div className="text-sm text-gray-500">{employee.user.email}</div>
      <div className="text-sm font-medium text-gray-500">{companyName}</div>
    </>
  )
}

const getPayrollAdvanceCurrencySymbol = (
  paymentMethod: PayrollAdvancePaymentMethod
) =>
  paymentMethod === PayrollAdvancePaymentMethod.WALLET
    ? CurrencySymbol.BUSD
    : CurrencySymbol.COP

export const PayrollAdvanceList = ({
  payrollAdvances,
  hideColumns,
  isAdmin = false,
}: PayrollAdvanceListProps) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Colaborador" />
                  <TableHeading title="Monto solicitado" isCentered />
                  <TableHeading title="Monto total" isCentered />
                  <TableHeading title="Fecha de solicitud" isCentered />

                  {!hideColumns?.status && (
                    <TableHeading title="Estado" isCentered />
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {payrollAdvances.map(
                  ({ employee, company, ...payrollAdvance }) => (
                    <tr key={payrollAdvance.id} className="hover:bg-gray-100">
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link to={`${payrollAdvance.id}`}>
                          {isAdmin && employee ? (
                            <>
                              <EmployeeNameTitle
                                employee={employee}
                                companyName={company.name}
                              />
                            </>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 underline hover:text-cyan-600">
                              {`Solicitud de ${formatMoney(
                                payrollAdvance.totalAmount,
                                getPayrollAdvanceCurrencySymbol(
                                  payrollAdvance.paymentMethod
                                )
                              )}`}
                            </div>
                          )}
                        </Link>
                      </td>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {formatMoney(
                            payrollAdvance.requestedAmount,
                            getPayrollAdvanceCurrencySymbol(
                              payrollAdvance.paymentMethod
                            )
                          )}
                        </div>
                      </TableData>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {formatMoney(
                            payrollAdvance.totalAmount,
                            getPayrollAdvanceCurrencySymbol(
                              payrollAdvance.paymentMethod
                            )
                          )}
                        </div>
                      </TableData>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {formatDate(
                            new Date(Date.parse(`${payrollAdvance.createdAt}`))
                          )}
                        </div>
                      </TableData>

                      {!hideColumns?.status && (
                        <TableData isCentered>
                          <PayrollAdvanceStatusPill
                            payrollAdvanceStatus={payrollAdvance.status}
                          />
                        </TableData>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
